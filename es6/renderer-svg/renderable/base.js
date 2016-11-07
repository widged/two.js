/* jshint esnext: true */

import Cache   from '../../lib/cache/Cache';
import rendererBridge   from '../../renderer/renderer-bridge';

const {preprocess} = rendererBridge;

const FN = {};

// ------------------------------------
//  Interface
// ------------------------------------

const shapeCache = new Cache((key) => { return require('./' + key).default; });

FN.renderScene = (gp, ctx) => {
  const {renderShape} = FN;
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
