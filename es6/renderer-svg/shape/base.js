/* jshint esnext: true */

import Cache   from '../../util/Cache';
import svgFN   from './fn-svg';


var FN = {};

// ------------------------------------
//  Interface
// ------------------------------------

var shapeCache = new Cache((key) => { return require('./' + key).default; });

FN.renderScene = (elm, ctx) => {
  var {renderShape} = FN;
  return renderShape(elm, ctx);
};

FN.renderShape = (elm, ctx, condi, clip) => {
  shapeCache.get(elm.rendererType)(elm, ctx, condi, clip);
};

export default FN;
