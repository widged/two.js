/* jshint esnext: true */

import is  from '../../lib/is/is';
import rendererBridge   from '../../renderer/renderer-bridge';
import rectFN from '../../lib/struct-bounding-rect/bounding-rect-fn';
import rendererFN from './fn-renderer';
import canvasFN   from './fn-canvas';
import base from './base';

var {isNumber, isString} = is;
var {getShapeProps, getShapeRenderer, anyPropChanged} = rendererBridge;
var {drawPathAnchors} = canvasFN;
var {hasGradientChanged, renderAnyPath, isHidden, updateAndClearCanvasRect} = rendererFN;
var {drawFill, drawStroke, drawGradientShape} = rendererFN;
var {includeAnchorInBoundingRect} = rectFN;
var {canvas, getContext, renderShape} = base;
var {max} = Math;



var renderPath = (shp, gl, program, forcedParent) => {

  var shapeProps = getShapeProps(shp);

  // <<< code that varies between text and path
  var getBoundingClientRect = (shp) => {
    var { anchorColl,  linewidth} = shapeProps;
    var anchors = anchorColl.items;
    return getPathBoundingClientRect(anchors, linewidth);
  };

  var assertShapeChange = (shp) => {
    return hasGradientChanged(shp) || anyPropChanged(shp.parent, ['cap','join','miter']);
  };
  // >>>

  var rendered = renderAnyPath(gl, program, shp, assertShapeChange, getBoundingClientRect, forcedParent, updateShapeCanvas);
  if(rendered) { shp.flagReset(); }
  return shp;

};

/**
 * Returns the rect of a set of anchors. Typically takes anchors that are
 * "centered" around 0 and returns them to be anchored upper-left.
 */
var getPathBoundingClientRect = function(anchors, border) { // border is shape linewidth

  var rect = null;
  for (var i = 0, ni = anchors.length, d = null; i < ni; i++) {
    rect = includeAnchorInBoundingRect(rect, anchors[i]);
  }

  // Expand borders
  var {top, left, right, bottom} = rect;
  if (isNumber(border)) {
    top    = top - border;
    left   = left - border;
    right  = right + border;
    bottom = bottom + border;
  }

  return {
    top, left, right, bottom,
    width: right - left, height: bottom - top,
    centroid: {x: - left, y: - top}
  };

};

var styleCanvasPath = (canvas, {cap,  join,  miter}) => {
  var context = getContext(canvas);
  // Path Properties
  if (miter)     { context.miterLimit = miter;     }
  if (join)      { context.lineJoin   = join;      }
  if (cap)       { context.lineCap    = cap;       }
  return;
};


var updateShapeCanvas = function(shp) {

  var shapeProps = getShapeProps(shp);
  var renderer = getShapeRenderer(shp);

  // styles
  var { anchorColl,  stroke,  linewidth,  fill,  opacity,  cap,  join,  miter,  closed} = shapeProps;
  var {scale, opacity: rendererOpacity, rect} = renderer;
  opacity = rendererOpacity || opacity;
  linewidth = linewidth * scale;

  // dimensions
  var context = getContext(canvas);
  var {width, height} = updateAndClearCanvasRect(canvas, rect.width, rect.height, scale);

  // Renderable properties
  if (isNumber(opacity)) { context.globalAlpha = opacity; }
  // :REVIEW: closure over shape
  var renderGradient = (gdt, context) => {  return drawGradientShape(gdt, context, shp); };
  if (fill)   { drawFill  (canvas, fill  , renderGradient); }
  if (stroke) { drawStroke(canvas, stroke, renderGradient); }
  if (linewidth) { context.lineWidth  = linewidth; }

  styleCanvasPath(canvas, {cap,  join,  miter});

  // save, scale and translate
  context.save();
  context.scale(renderer.scale, renderer.scale);
  // :REVIEW: why force everything on the centroid?
  var {x, y} = renderer.rect.centroid;
  context.translate(x, y);

  var anchors = anchorColl.items;
  drawPathAnchors(canvas, anchors, closed);

  if (!isHidden.test(fill))   context.fill();
  if (!isHidden.test(stroke)) context.stroke();

  context.restore();
};

export default renderPath;
