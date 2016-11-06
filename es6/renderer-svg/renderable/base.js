/* jshint esnext: true */

import Cache   from '../../lib/cache/Cache';
import shapeRendering   from '../../renderer/renderer-bridge';

var {preprocess} = shapeRendering;


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
  if(!renderFn) { console.log('[svg.renderShape] Renderer not found', shp.shapeType); }
  // TODO: Add a check here to only invoke update if need be.
  preprocess(shp);
  // call the render function for that shape type
  shapeCache.get(shp.shapeType)(shp, ctx, condi, clip);
};

export default FN;