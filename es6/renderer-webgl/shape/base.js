/* jshint esnext: true */

import _  from '../../util/common';
import Cache   from '../../util/Cache';

var FN = {};

// ------------------------------------
//  Interface
// ------------------------------------

var shapeCache = new Cache((key) => { return require('./' + key).default; });

FN.renderScene = (elm, ctx, program) => {
  var {renderShape} = FN;
  return renderShape(elm, ctx, program);
};


FN.renderShape = (elm, ctx, condi, clip) => {
  var renderFn = shapeCache.get(elm.rendererType);
  if(!renderFn) { console.log('Not found'); }
  renderFn.render(elm, ctx, condi, clip);
};



// ------------------------------------
//  Utilities available to all shapes
// ------------------------------------


FN.canvas = (() => {
  if(!document) { throw "Sorry, doesn't seem to be supported!"; }
  return document.createElement('canvas');
})();

FN.getContext = (canvas) => {
  return canvas.getContext('2d');
};

FN.isCanvasContext = (canvasContext) => { return canvasContext.canvas.getContext('2d'); }


export default FN;
