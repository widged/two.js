/* jshint esnext: true */

import Cache   from '../../util/Cache';
import Commands from '../../constant/CommandTypes';

var FN = {};

// ------------------------------------
//  Interface
// ------------------------------------

var shapeCache = new Cache((key) => { return require('./' + key).default; });

FN.renderScene = (gp, ctx) => {
  var {renderShape} = FN;
  return renderShape(gp, ctx);
};

FN.renderShape = (shp, ctx, condi, clip) => {
  var renderFn = shapeCache.get(shp.rendererType);
  if(!renderFn) { console.log('[canvas.renderShape] Renderer not found', shp.rendererType); }
  shapeCache.get(shp.rendererType)(shp, ctx, condi, clip);
};

// ------------------------------------
//  Utilities available to all shapes
// ------------------------------------

FN.Commands = Commands;

FN.isHidden = /(none|transparent)/i;

FN.shim = function(elem) {
  elem.tagName = 'FN';
  elem.nodeType = 1;
  return elem;
};

// Returns true if that is a non-transforming matrix
FN.isDefaultMatrix = (m) => {
  return (m[0] == 1 && m[3] == 0 && m[1] == 0 && m[4] == 1 && m[2] == 0 && m[5] == 0);
};

export default FN;

/*
function resetTransform(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
*/
