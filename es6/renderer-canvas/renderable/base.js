/* jshint esnext: true */

import Cache   from '../../lib/cache/Cache';
import Commands from '../../lib/struct-anchor/CommandTypes';
import rendererBridge   from '../../renderer/renderer-bridge';

var {preprocess} = rendererBridge;

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
  var renderFn = shapeCache.get(shp.shapeType);
  if(!renderFn) { console.log('[canvas.renderShape] Renderer not found', shp.shapeType); }
  // TODO: Add a check here to only invoke update if need be.
  preprocess(shp);
  // call the render function for that shape type
  shapeCache.get(shp.shapeType)(shp, ctx, condi, clip);
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
