/* jshint esnext: true */

import _  from '../../util/common';
import Cache   from '../../util/Cache';

var FN = {};

// ------------------------------------
//  Interface
// ------------------------------------

var shapeCache = new Cache((key) => { return require('./' + key).default; });

FN.renderScene = (gp, ctx, program) => {
  var {renderShape} = FN;
  return renderShape(gp, ctx, program);
};


FN.renderShape = (shp, ctx, condi, clip) => {
  var renderFn = shapeCache.get(shp.rendererType);
  if(!renderFn) { console.log('[webgl.renderShape] Renderer not found', shp.rendererType); }
  // console.log('--------------')
  // console.log(shp.constructor.name, shp.changeTracker.listChanges());
  renderFn.render(shp, ctx, condi, clip);
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
