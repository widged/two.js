/* jshint esnext: true */

import Cache   from '../../util/Cache';
import shapeRendering   from '../../renderer-lib/renderer-bridge';

var {updateShape} = shapeRendering;


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
  if(!renderFn) { console.log('[svg.renderShape] Renderer not found', shp.rendererType); }
  // TODO: Add a check here to only invoke update if need be.
  updateShape(shp);
  // call the render function for that shape type
  shapeCache.get(shp.rendererType)(shp, ctx, condi, clip);
};

export default FN;
