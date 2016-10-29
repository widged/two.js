import is  from '../../util/is';
import _  from '../../util/common';
import Cache   from '../../util/Cache';
import Matrix   from '../../struct/Matrix';
import Array2   from '../../struct/Array';
import Commands from '../../constant/CommandTypes';

var {isObject} = is;


var base = {
  isHidden: /(none|transparent)/i,

  canvas: (document ? document.createElement('canvas') : { getContext: _.identity }),

  alignments: {
    left: 'start',
    middle: 'center',
    right: 'end'
  },

  matrix: new Matrix(),

  uv: new Array2([
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1
  ]),

 getTriangles: function(rect, triangles) {

    var top = rect.top,
        left = rect.left,
        right = rect.right,
        bottom = rect.bottom;

    // First Triangle

    triangles[0] = left;
    triangles[1] = top;

    triangles[2] = right;
    triangles[3] = top;

    triangles[4] = left;
    triangles[5] = bottom;

    // Second Triangle

    triangles[6] = left;
    triangles[7] = bottom;

    triangles[8] = right;
    triangles[9] = top;

    triangles[10] = right;
    triangles[11] = bottom;

  },

  updateTexture: function(gl, elem) {

    base.updateCanvas(elem, base)

    if (elem._renderer.texture) {
      gl.deleteTexture(elem._renderer.texture);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, elem._renderer.textureCoordsBuffer);

    elem._renderer.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, elem._renderer.texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    if (this.canvas.width <= 0 || this.canvas.height <= 0) {
      return;
    }

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);

  },

  updateBuffer: function(gl, elem, program) {

    if (isObject(elem._renderer.buffer)) {
      gl.deleteBuffer(elem._renderer.buffer);
    }

    elem._renderer.buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, elem._renderer.buffer);
    gl.enableVertexAttribArray(program.position);

    gl.bufferData(gl.ARRAY_BUFFER, elem._renderer.triangles, gl.STATIC_DRAW);

    if (isObject(elem._renderer.textureCoordsBuffer)) {
      gl.deleteBuffer(elem._renderer.textureCoordsBuffer);
    }

    elem._renderer.textureCoordsBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, elem._renderer.textureCoordsBuffer);
    gl.enableVertexAttribArray(program.textureCoords);

    gl.bufferData(gl.ARRAY_BUFFER, this.uv, gl.STATIC_DRAW);

  },

  program: {

    create: function(gl, shaders) {
      var program, linked, error;
      program = gl.createProgram();
      _.each(shaders, function(s) {
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

    }

  },

  shaders: {

    create: function(gl, source, type) {
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

    },

    types: {
      vertex: 'VERTEX_SHADER',
      fragment: 'FRAGMENT_SHADER'
    },

    vertex: [
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

    fragment: [
      'precision mediump float;',
      '',
      'uniform sampler2D u_image;',
      'varying vec2 v_textureCoords;',
      '',
      'void main() {',
      '  gl_FragColor = texture2D(u_image, v_textureCoords);',
      '}'
    ].join('\n')

  }  
}


base.ctx = base.canvas.getContext('2d');
base.Commands = Commands;
base.transformation = new Array2(9);

var cachedShape = new Cache((key) => { return require('./' + key).default; });

base.renderShape = (elm, ctx, condi, clip) => {
  var type = elm._renderer.type;
  cachedShape.get(type).render.call(elm, ctx, condi, clip);
};

base.updateCanvas = (elem, webgl) => {
  var type = elem._renderer.type;
  cachedShape.get(type).updateCanvas.call(webgl, elem);
}

export default base;