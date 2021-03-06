/* jshint esnext: true */

import Cache   from '../../lib/cache/Cache';
import rendererBridge   from '../../renderer/renderer-bridge';

const {preprocess} = rendererBridge;

const FN = {};

// ------------------------------------
//  Interface
// ------------------------------------

const shapeCache = new Cache((key) => { return require('./' + key).default; });

FN.renderScene = (gp, ctx, program) => {
  const {renderShape} = FN;
  return renderShape(gp, ctx, program);
};


FN.renderShape = (shp, ctx, condi, clip) => {
  const renderFn = shapeCache.get(shp.shapeType);
  if(!renderFn) { console.log('[webgl.renderShape] Renderer not found', shp.shapeType); }
  // TODO: Add a check here to only invoke update if need be.
  preprocess(shp);
  // call the render function for that shape type
  shapeCache.get(shp.shapeType)(shp, ctx, condi, clip);
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
