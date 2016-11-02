/* jshint esnext: true */

import is  from '../../util/is';
import base from './base';

var {transformation, updateCanvas} = base;
var {isObject} = is;

var FN = {};


FN.updateTexture = function(base, gl, elem) {

  updateCanvas(elem, FN);

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

  if (base.canvas.width <= 0 || base.canvas.height <= 0) {
    return;
  }

  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, base.canvas);

};

FN.updateBuffer = function(base, gl, elem, program) {

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

  gl.bufferData(gl.ARRAY_BUFFER, base.uv, gl.STATIC_DRAW);

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

export default FN;
