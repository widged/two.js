/* jshint esnext: true */

import is  from '../../lib/is/is';
import LinearGradient from '../../renderable/path-gradient/LinearGradient';
import RadialGradient from '../../renderable/path-gradient/RadialGradient';
import rendererBridge from '../../renderer/renderer-bridge';
import Matrix   from '../../lib/struct-matrix/Matrix';
import FloatArray   from '../../lib/struct-float-array/FloatArray';
import base from './base';
import glFN   from './fn-gl';

const {getShapeProps, getShapeMatrix, updateShape, anyPropChanged, getShapeRenderer, raiseFlags} = rendererBridge;
const {Multiply: multiplyMatrix} = Matrix;
const {updateBuffer, updateTexture, drawTextureAndRect} = glFN;
const {getContext, renderShape} = base;

const {isObject, isString} = is;

const FN = {};

FN.isHidden = /(none|transparent)/i;

FN.hasGradientChanged = (shp) => {
  var {fill,  stroke} = getShapeProps( shp, ["fill","stroke"] );
  return (fill   instanceof LinearGradient && anyPropChanged(fill,   ['spread','stops','endPoints']))
      || (stroke instanceof LinearGradient && anyPropChanged(stroke, ['spread','stops','endPoints']))
      || (fill   instanceof RadialGradient && anyPropChanged(fill,   ['spread','stops','radius','center','focal']))
      || (stroke instanceof RadialGradient && anyPropChanged(stroke, ['spread','stops','radius','center','focal']));
};


const removeChildNode = function(child, gl) {
  if (child.children) {
    for (var i = 0; i < child.children.length; i++) {
      removeChildNode(child.children[i], gl);
    }
    return;
  }
  var renderer = getShapeRenderer(child);
  glFN.remove(gl, renderer.texture);
  renderer.texture = undefined;
};


FN.removeNodes = (nodes, gl) => {
  for (var i = 0; i < (nodes || []).length; i++) {
    removeChildNode(nodes[i], gl);
  }

};


FN.drawFill = (canvas, fill, renderGradient) => {
  var context = getContext(canvas);
  if (isString(fill)) {
    context.fillStyle = fill;
  } else {
    // fill is a Gradient shape
    context.fillStyle = renderGradient(fill, context);
  }

};
FN.drawStroke = (canvas, stroke, renderGradient) => {
  var context = getContext(canvas);
  if (isString(stroke)) {
    context.strokeStyle = stroke;
  } else {
    // stroke is a Gradient shape
    context.strokeStyle = renderGradient(stroke, context);
  }
};
FN.drawGradientShape = (gdt, context, shp) => {
  // renderShape constructs the gdt renderer
  renderShape(gdt, context, shp);
  return getShapeRenderer(gdt).gradient;
};


FN.renderAnyPath = (gl, program, shp, assertShapeChange, getBoundingClientRect, forcedParent, updateShapeCanvas) => {

  const {updateRendererIfNecesary} = FN;

  var completed = false;

  // nothing to do if there is nothing visible to the user
  var { visible,  opacity,  clip /*,  mask*/} = getShapeProps( shp,
      ["visible","opacity","clip"/*,"mask"*/] );

  if (!visible || !opacity)  { return completed; }
  if (clip && !forcedParent) { return completed; }

  // if (mask) {
  //  var maskRenderer = getShapeRenderer(mask);
  //  webgl[maskRenderer.type].render(mask, gl, program, shp);
  // }

  updateShape(shp);

  var renderer = updateRendererIfNecesary(shp, gl, program, assertShapeChange, getBoundingClientRect, updateShapeCanvas);
  // :REVIEW: do we need to redraw if the renderer did not change?
  drawTextureAndRect({
    gl: gl,
    coordBind: renderer.textureCoordsBuffer,
    textureBind: renderer.texture,
    rectMatrix: renderer.matrix,
    rectBind: renderer.buffer,
    coordVertex: program.textureCoords,
    rectMatrixBuffer: program.matrix,
    rectVertex: program.position
  });

  return true;
};


FN.updateRendererIfNecesary   =  (shp, gl, program, assertShapeChange, getBoundingClientRect, updateShapeCanvas) => {
  const {recomputeTrianglesAndRectIfNecessary, recomputeMatrixAndScaleIfNecessary} = FN;
  // main
  var renderer = recomputeMatrixAndScaleIfNecessary(shp);
  var parentRenderer  = getShapeRenderer(shp.parent);

  var tracker = {change: false};
  renderer = recomputeTrianglesAndRectIfNecessary(shp, assertShapeChange, getBoundingClientRect, tracker) || {};
  if(tracker.change === true) {
    var {opacity} = getShapeProps( shp, ["opacity"] );
    renderer.opacity = opacity * parentRenderer.opacity;
    var {buffer, textureCoordsBuffer} = updateBuffer(gl, program, renderer);
    renderer.buffer = buffer;
    renderer.textureCoordsBuffer = textureCoordsBuffer;
    updateShapeCanvas(shp, FN);
    updateTexture(gl, base.canvas, renderer); // :FIXME: it should be the ctx, not the base.canvas
  }
  return renderer;
};

// :NOTE: the old `triangles` is passed as an argument for the only
// purpose of avoiding to unnecessarily re-create obects.
// it will be completely ovewritten
var updateRectangleTriangles = function(rect, triangles) {

  var {top, left, right, bottom} = rect;

  if(!triangles) { triangles = new FloatArray(12); }

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

  return triangles;

};


FN.recomputeTrianglesAndRectIfNecessary = (shp, assertShapeChange, getBoundingClientRect, tracker) => {

  var renderer = getShapeRenderer(shp);

  if (!renderer.texture
   || anyPropChanged(shp, ['anchors','fill','stroke','linewidth','opacity','visible','scale'])
   || anyPropChanged(parent, ['opacity'])
   || assertShapeChange(shp)
 ) {
    tracker.change = true;
    var rect = renderer.rect = getBoundingClientRect(shp);
    renderer.triangles = updateRectangleTriangles(rect, renderer.triangles);
  }
  return renderer;
};


FN.recomputeMatrixAndScaleIfNecessary = (shp) => {

  var parent = shp.parent;
  var shapeProps = getShapeProps(shp);
  var { scale} = shapeProps;
  var  matrix  = getShapeMatrix(shp);
  var parentMatrix = getShapeMatrix(parent);

  var renderer        = getShapeRenderer(shp);
  var parentRenderer  = getShapeRenderer(parent);

  // update matrix only if necessary
  var rendererMatrix;
  var parentMatrixChanged = (parentMatrix && parentMatrix.manual) || anyPropChanged(parent, ['matrix']);
  if ( matrix.manual || anyPropChanged(shp, ['matrix']) ||  parentMatrixChanged ) {
    var transformation = (new FloatArray(9));
    matrix.toArray(true, transformation); // Reduce amount of object / array creation / deletion
    renderer.matrix = multiplyMatrix(transformation, parentRenderer.matrix, renderer.matrix );
    renderer.scale = scale * parentRenderer.scale;
    // In group  but not in `path` or `text`. Used to trickle down any matrix change to the `children`
    // of the group (who will check for a parentMatrixChanged).
    if (parentMatrixChanged) { raiseFlags(shp, ['matrix']); }
  }

  return renderer;

};


FN.updateAndClearCanvasRect = (canvas, width, height, scale) => {
  var {max, ceil} = Math;
  width  = max(ceil(width * scale), 1);
  height = max(ceil(height * scale), 1);
  canvas.width  = width; canvas.height = height;
  var context = getContext(canvas);
  context.clearRect(0, 0, width, height);
  return {width, height};
};


export default FN;
