/* jshint esnext: true */

import base from './base';
import shapeRendering   from '../../shape-rendering';

var {anyPropChanged, updateShape, getShapeProps, getShapeRenderer} = shapeRendering;
var {isDefaultMatrix, renderShape} = base;

var group = function(shp, ctx) {

  // TODO: Add a check here to only invoke update if need be.

  updateShape(shp);

  var renderer = getShapeRenderer(shp);
  var parentRenderer = getShapeRenderer(shp.parent);

  var { matrix, opacity, mask, clip } = getShapeProps(shp, ['matrix','opacity','mask','clip']);

  var parent = shp.parent;
  renderer.opacity = opacity * (parent && parentRenderer ? parentRenderer.opacity : 1);

  if (!renderer.context) { renderer.context = {}; }
  renderer.context.ctx = ctx;
  // renderer.context.clip = clip;

  var matrixElem = matrix.elements;
  var defaultMatrix = isDefaultMatrix(matrixElem);
  if (!defaultMatrix) {
    ctx.save();
    ctx.transform(matrixElem[0], matrixElem[3], matrixElem[1], matrixElem[4], matrixElem[2], matrixElem[5]);
  }

  if (mask) {
    renderShape(mask, ctx, true);
  }

  for (var i = 0; i < shp.children.length; i++) {
    var child = shp.children[i];
    renderShape(child, ctx);
  }

  if (!defaultMatrix) {
    ctx.restore();
  }

 /**
 * Commented two-way functionality of clips / masks with groups and
 * polygons. Uncomment when that bug is fixed:
 * https://code.google.com/p/chromium/issues/detail?id=370951
 */

  // if (clip) {
  //   ctx.clip();
  // }

  return shp.flagReset();

};


  export default group;
