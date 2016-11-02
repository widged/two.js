/* jshint esnext: true */

import is  from '../../util/is';
import LinearGradient from '../../shape/gradient/LinearGradient';
import RadialGradient from '../../shape/gradient/RadialGradient';
import shapeRendering   from '../../shape-rendering';
import Matrix   from '../../struct/Matrix';
import Array2   from '../../struct/Array';
import base from './base';
import gl   from './renderer-gl';

var {getShapeProps, updateShape, anyPropChanged, getShapeRenderer} = shapeRendering;
var {Multiply: multiplyMatrix} = Matrix;
var {transformation, updateCanvas} = base;
var {updateBuffer, updateTexture, drawTextureAndRect} = gl;


var {isObject} = is;

var FN = {};

FN.hasGradientChanged = (shp) => {
  var {fill,  stroke} = getShapeProps( shp, ["fill","stroke"] );
  return (fill   instanceof LinearGradient && anyPropChanged(fill,   ['spread','stops','endPoints']))
      || (stroke instanceof LinearGradient && anyPropChanged(stroke, ['spread','stops','endPoints']))
      || (fill   instanceof RadialGradient && anyPropChanged(fill,   ['spread','stops','radius','center','focal']))
      || (stroke instanceof RadialGradient && anyPropChanged(stroke, ['spread','stops','radius','center','focal']));
};

FN.renderPath = (gl, program, shp, shapeChange, getBoundingClientRect) => {
  var {updateRendererIfNecesary} = FN;
  var renderer = updateRendererIfNecesary(shp, gl, program, shapeChange, getBoundingClientRect);
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
};



FN.updateRendererIfNecesary   =  (shp, gl, program, shapeChange, getBoundingClientRect) => {
  var {recomputePathTrianglesIfNecessary, recomputePathMatrixIfNecessary} = FN;
  // main
  var renderer        = getShapeRenderer(shp);
  var parentRenderer  = getShapeRenderer(shp.parent);

  var rendererMatrix = recomputePathMatrixIfNecessary(shp);
  if(rendererMatrix) {
    var {scale} = getShapeProps( shp, ["scale"] );
    renderer.matrix = rendererMatrix;
    renderer.scale = scale * parentRenderer.scale;
  }

  var {triangles, rect} = recomputePathTrianglesIfNecessary(shp, shapeChange, getBoundingClientRect) || {};
  if(triangles) {
    var {opacity} = getShapeProps( shp, ["opacity"] );
    renderer.opacity = opacity * parentRenderer.opacity;
    renderer.rect      = rect;
    renderer.triangles = triangles;
    updateBuffer(base, gl, shp, program);
    updateTexture(base, gl, shp);
  }
  return renderer;
};

FN.recomputePathMatrixIfNecessary = (shp) => {

  var parent = shp.parent;
  var { matrix} = getShapeProps( shp, ["matrix"] );
  var {matrix: parentMatrix} = getShapeProps( parent,   ["matrix"] );

  var renderer        = getShapeRenderer(shp);
  var parentRenderer  = getShapeRenderer(parent);

  // update matrix only if necessary
  var rendererMatrix;
  if ( matrix.manual
    || parentMatrix.manual
    || anyPropChanged(shp, ['matrix'])
    || anyPropChanged(parent, ['matrix'])
  ) {

    matrix.toArray(true, transformation); // Reduce amount of object / array creation / deletion
    rendererMatrix = multiplyMatrix(transformation, parentRenderer.matrix, renderer.matrix );
  }
  return rendererMatrix;

};



FN.recomputePathTrianglesIfNecessary = (shp, shapeChange, getBoundingClientRect) => {

  var {getTriangles} = FN;

  var renderer = getShapeRenderer(shp);

  var rect, triangles;
  if (!renderer.texture
   || anyPropChanged(shp, ['vertices','fill','stroke','linewidth','opacity','visible','scale'])
   || anyPropChanged(parent, ['opacity'])
   || shapeChange
 ) {
    rect      = getBoundingClientRect(shp);
    triangles = getTriangles(rect, renderer.triangles);
  }
  return {rect, triangles};
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
