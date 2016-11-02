/* jshint esnext: true */

import is  from '../../util/is';
import base from './base';

var {updateCanvas} = base;
var {isObject} = is;

var FN = {};


FN.updateTexture = function(base, gl, shp) {

  updateCanvas(shp, FN);

  if (shp._renderer.texture) {
    gl.deleteTexture(shp._renderer.texture);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, shp._renderer.textureCoordsBuffer);

  shp._renderer.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, shp._renderer.texture);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  if (base.canvas.width <= 0 || base.canvas.height <= 0) {
    return;
  }

  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, base.canvas);

};

FN.updateBuffer = function(base, gl, shp, program) {

  if (isObject(shp._renderer.buffer)) {
    gl.deleteBuffer(shp._renderer.buffer);
  }

  shp._renderer.buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, shp._renderer.buffer);
  gl.enableVertexAttribArray(program.position);

  gl.bufferData(gl.ARRAY_BUFFER, shp._renderer.triangles, gl.STATIC_DRAW);

  if (isObject(shp._renderer.textureCoordsBuffer)) {
    gl.deleteBuffer(shp._renderer.textureCoordsBuffer);
  }

  shp._renderer.textureCoordsBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, shp._renderer.textureCoordsBuffer);
  gl.enableVertexAttribArray(program.textureCoords);

  gl.bufferData(gl.ARRAY_BUFFER, base.uv, gl.STATIC_DRAW);

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
