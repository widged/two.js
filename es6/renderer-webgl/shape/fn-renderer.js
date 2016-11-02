/* jshint esnext: true */

import is  from '../../util/is';
import LinearGradient from '../../shape/gradient/LinearGradient';
import RadialGradient from '../../shape/gradient/RadialGradient';
import shapeRendering   from '../../shape-rendering';
import Matrix   from '../../struct/Matrix';
import Array2   from '../../struct/Array';
import base from './base';
import glFN   from './fn-gl';

var {getShapeProps, updateShape, anyPropChanged, getShapeRenderer, raiseFlags} = shapeRendering;
var {Multiply: multiplyMatrix} = Matrix;
var {updateCanvas} = base;
var {updateBuffer, updateTexture, drawTextureAndRect} = glFN;


var {isObject} = is;

var FN = {};

FN.hasGradientChanged = (shp) => {
  var {fill,  stroke} = getShapeProps( shp, ["fill","stroke"] );
  return (fill   instanceof LinearGradient && anyPropChanged(fill,   ['spread','stops','endPoints']))
      || (stroke instanceof LinearGradient && anyPropChanged(stroke, ['spread','stops','endPoints']))
      || (fill   instanceof RadialGradient && anyPropChanged(fill,   ['spread','stops','radius','center','focal']))
      || (stroke instanceof RadialGradient && anyPropChanged(stroke, ['spread','stops','radius','center','focal']));
};

FN.renderPath = (gl, program, shp, assertShapeChange, getBoundingClientRect) => {

  var completed = false;

  var {updateRendererIfNecesary} = FN;

  // nothing to do if there is nothing visible to the user
  var { visible,  opacity,  clip /*,  mask*/} = getShapeProps( shp,
      ["visible","opacity","clip"/*,"mask"*/] );

  if (!visible || !opacity)  { return completed; }
  if (clip && !forcedParent) { return completed; }

  // if (mask) {
  //  var maskRenderer = getShapeRenderer(mask);
  //  webgl[maskRenderer.type].render.call(mask, gl, program, shp);
  // }

  updateShape(shp);

  var renderer = updateRendererIfNecesary(shp, gl, program, assertShapeChange, getBoundingClientRect);
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



FN.updateRendererIfNecesary   =  (shp, gl, program, assertShapeChange, getBoundingClientRect) => {
  var {recomputeTrianglesAndRectIfNecessary, recomputeMatrixAndScaleIfNecessary} = FN;
  // main
  var renderer = recomputeMatrixAndScaleIfNecessary(shp);
  var parentRenderer  = getShapeRenderer(shp.parent);

  var tracker = {change: false};
  renderer = recomputeTrianglesAndRectIfNecessary(shp, assertShapeChange, getBoundingClientRect, tracker) || {};
  if(tracker.change === true) {
    var {opacity} = getShapeProps( shp, ["opacity"] );
    renderer.opacity = opacity * parentRenderer.opacity;
    updateBuffer(base, gl, shp, program);
    updateTexture(base, gl, shp);
  }
  return renderer;
};


FN.recomputeTrianglesAndRectIfNecessary = (shp, assertShapeChange, getBoundingClientRect, tracker) => {

  var {getTriangles} = FN;

  var renderer = getShapeRenderer(shp);

  if (!renderer.texture
   || anyPropChanged(shp, ['vertices','fill','stroke','linewidth','opacity','visible','scale'])
   || anyPropChanged(parent, ['opacity'])
   || assertShapeChange(shp)
 ) {
    tracker.change = true;
    var rect = renderer.rect = getBoundingClientRect(shp);
    renderer.triangles = getTriangles(rect, renderer.triangles);
  }
  return renderer;
};


FN.recomputeMatrixAndScaleIfNecessary = (shp) => {

  var parent = shp.parent;
  var { matrix, scale} = getShapeProps( shp, ["matrix","scale"] );
  var { matrix: parentMatrix} = getShapeProps( parent,   ["matrix"] );

  var renderer        = getShapeRenderer(shp);
  var parentRenderer  = getShapeRenderer(parent);

  // update matrix only if necessary
  var rendererMatrix;
  var parentMatrixChanged = (parentMatrix && parentMatrix.manual) || anyPropChanged(parent, ['matrix']);
  if ( matrix.manual || anyPropChanged(shp, ['matrix']) ||  parentMatrixChanged ) {
    var transformation = (new Array2(9));
    matrix.toArray(true, transformation); // Reduce amount of object / array creation / deletion
    renderer.matrix = multiplyMatrix(transformation, parentRenderer.matrix, renderer.matrix );
    renderer.scale = scale * parentRenderer.scale;
    // In group  but not in `path` or `text`. Used to trickle down any matrix change to the children
    // of the group (who will check for a parentMatrixChanged).
    if (parentMatrixChanged) { raiseFlags(shp, ['matrix']); }
  }

  return renderer;

};


FN.getTriangles = function(rect, triangles) {

  var top = rect.top,
      left = rect.left,
      right = rect.right,
      bottom = rect.bottom;

  // First Triangle

  if(!triangles) { triangles = new Array2(12); }

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


export default FN;
