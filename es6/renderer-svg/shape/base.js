/* jshint esnext: true */

import Cache   from '../../util/Cache';
import svgFN   from './fn-svg';


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
  shapeCache.get(shp.rendererType)(shp, ctx, condi, clip);
};

export default FN;
