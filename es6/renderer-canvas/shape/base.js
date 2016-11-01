/* jshint esnext: true */

import Cache   from '../../util/Cache';
import Commands from '../../constant/CommandTypes';

var FN = {};

// ------------------------------------
//  Interface
// ------------------------------------

var shapeCache = new Cache((key) => { return require('./' + key).default; });

FN.renderShape = (elm, ctx, condi, clip) => {
  shapeCache.get(elm.rendererType).call(elm, ctx, condi, clip);
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

// Returns true if this is a non-transforming matrix
FN.isDefaultMatrix = (m) => {
  return (m[0] == 1 && m[3] == 0 && m[1] == 0 && m[4] == 1 && m[2] == 0 && m[5] == 0);
};

export default FN;

/*
function resetTransform(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
*/
