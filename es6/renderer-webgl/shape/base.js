/* jshint esnext: true */

import is  from '../../util/is';
import _  from '../../util/common';
import Cache   from '../../util/Cache';
import Matrix   from '../../struct/Matrix';
import Array2   from '../../struct/Array';
import Commands from '../../constant/CommandTypes';

var {isObject} = is;

var FN = {};

// ------------------------------------
//  Interface
// ------------------------------------

var shapeCache = new Cache((key) => { return require('./' + key).default; });

FN.renderShape = (elm, ctx, condi, clip) => {
  var type = elm._renderer.type;
  shapeCache.get(type).render.call(elm, ctx, condi, clip);
};

FN.Commands = Commands;


// ------------------------------------
//  Utilities available to all shapes
// ------------------------------------

FN.isHidden = /(none|transparent)/i;

FN.canvas = (document ? document.createElement('canvas') : { getContext: (v) =>  { return v; } });

FN.matrix = new Matrix();

FN.ctx = FN.canvas.getContext('2d');

FN.transformation = new Array2(9);

FN.uv = new Array2([
  0, 0,
  1, 0,
  0, 1,
  0, 1,
  1, 0,
  1, 1
]);

FN.getTriangles = function(rect, triangles) {

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

};

FN.updateTexture = function(gl, elem) {

  FN.updateCanvas(elem, FN);

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

};

FN.updateBuffer = function(gl, elem, program) {

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

};


FN.updateCanvas = (elem, webgl) => {
  var type = elem._renderer.type;
  shapeCache.get(type).updateCanvas.call(webgl, elem);
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
