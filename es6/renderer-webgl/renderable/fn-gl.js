/* jshint esnext: true */

import is  from '../../lib/is/is';
import TwoError from '../../TwoError';
import Array2   from '../../lib/struct-array/Array';

var {isObject} = is;

var FN = {};

var SHADER_SOURCES = {

  VERTEX_SHADER: [
    'attribute vec2 a_position;',
    'attribute vec2 a_textureCoords;',
    '',
    'uniform mat3 u_matrix;',
    'uniform vec2 u_resolution;',
    '',
    'varying vec2 v_textureCoords;',
    '',
    'void main() {',
    '   vec2 projected = (u_matrix * vec3(a_position, 1.0)).xy;',
    '   vec2 normal = projected / u_resolution;',
    '   vec2 clipspace = (normal * 2.0) - 1.0;',
    '',
    '   gl_Position = vec4(clipspace * vec2(1.0, -1.0), 0.0, 1.0);',
    '   v_textureCoords = a_textureCoords;',
    '}'
  ].join('\n'),

  FRAGMENT_SHADER: [
    'precision mediump float;',
    '',
    'uniform sampler2D u_image;',
    'varying vec2 v_textureCoords;',
    '',
    'void main() {',
    '  gl_FragColor = texture2D(u_image, v_textureCoords);',
    '}'
  ].join('\n')

};


var createShader=  function(gl, type) {
  var source = SHADER_SOURCES[type];
  var shader, compiled, error;
  shader = gl.createShader(gl[type]);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new TwoError('unable to compile shader ' + shader + ': ' + error);
  }

  return shader;
};

var createProgram = function(gl, shaders) {

    var program, linked, error;
    program = gl.createProgram();
    shaders.forEach(function(s) {
      gl.attachShader(program, s);
    });

    gl.linkProgram(program);
    linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      error = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new TwoError('unable to link program: ' + error);
    }
    return program;
};

FN.initializeGL = (domElement, options) => {
  var gl = domElement.getContext('webgl', options) ||
           domElement.getContext('experimental-webgl', options);

  if (!gl) {
    throw new TwoError(
      'unable to create a webgl context. Try using another renderer.');
  }

  // Compile Base Shaders to draw in pixel space.
  var vs = createShader( gl, 'VERTEX_SHADER');
  var fs = createShader( gl, 'FRAGMENT_SHADER');

  var program = createProgram(gl, [vs, fs]);
  gl.useProgram(program);

  // Create and bind the drawing buffer
  // look up where the vertex data needs to go.
  program.position      = gl.getAttribLocation (program, 'a_position');
  program.matrix        = gl.getUniformLocation(program, 'u_matrix');
  program.textureCoords = gl.getAttribLocation (program, 'a_textureCoords');

  // Copied from Three.js WebGLRenderer
  gl.disable(gl.DEPTH_TEST);

  // Setup some initial statements of the gl context
  gl.enable(gl.BLEND);

  // https://code.google.com/p/chromium/issues/detail?id=316393
  // gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, gl.TRUE);

  gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
    gl.ONE, gl.ONE_MINUS_SRC_ALPHA );

  return {gl, program};
};

FN.clear = (gl) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

FN.updateResolution = (gl, program, width, height) => {
  var resLocation = gl.getUniformLocation( program, 'u_resolution');
  gl.viewport (0, 0, width, height);
  gl.uniform2f(resLocation, width, height);
  return gl;
};


FN.updateTexture = function(gl, canvas, renderer) {

  if (renderer.texture) {
    gl.deleteTexture(renderer.texture);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, renderer.textureCoordsBuffer);

  renderer.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, renderer.texture);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  if (canvas.width <= 0 || canvas.height <= 0) {
    return;
  }

  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

};

var uv = new Array2([
  0, 0,
  1, 0,
  0, 1,
  0, 1,
  1, 0,
  1, 1
]);

FN.updateBuffer = function(gl, program, renderer) {

  var {buffer,triangles,textureCoordsBuffer} = renderer;
  var {position, textureCoords} = program;

  if (isObject(buffer)) {
    gl.deleteBuffer(buffer);
  }

  buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(position);

  gl.bufferData(gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW);

  if (isObject(textureCoordsBuffer)) {
    gl.deleteBuffer(textureCoordsBuffer);
  }

  textureCoordsBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);
  gl.enableVertexAttribArray(textureCoords);

  gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);

  return {gl, buffer, textureCoordsBuffer};

};

FN.remove = (gl, texture) => {
  // Deallocate texture to free up gl memory.
  gl.deleteTexture(texture);
};


FN.drawTextureAndRect = ({
    gl,
    coordBind, coordVertex, textureBind,
    rectMatrixBuffer, rectMatrix, rectBind, rectVertex
  }) => {

  // Draw Texture
  gl.bindBuffer(gl.ARRAY_BUFFER, coordBind);
  gl.vertexAttribPointer(coordVertex, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, textureBind);

  // Draw Rect
  gl.uniformMatrix3fv(rectMatrixBuffer, false, rectMatrix);
  gl.bindBuffer(gl.ARRAY_BUFFER, rectBind);
  gl.vertexAttribPointer(rectVertex, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  return gl;
};

FN.MaskMode = (function() {
  var activeMaskMode = (gl, renderFn) => {
    gl.enable(gl.STENCIL_TEST);
    gl.stencilFunc(gl.ALWAYS, 1, 1);

    gl.colorMask(false, false, false, true);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);

    renderFn();

    gl.colorMask(true, true, true, true);
    gl.stencilFunc(gl.NOTEQUAL, 0, 1);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

  };

  var desactivateMaskMode = (gl, renderFn) => {
    gl.colorMask(false, false, false, false);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);

    renderFn();

    gl.colorMask(true, true, true, true);
    gl.stencilFunc(gl.NOTEQUAL, 0, 1);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

    gl.disable(gl.STENCIL_TEST);

  };

  return (gl, renderFn) => {
    return {
      on:  () => { activeMaskMode(gl, renderFn); },
      off: () => { desactivateMaskMode(gl, renderFn); }
    };
  };


} ());

export default FN;
