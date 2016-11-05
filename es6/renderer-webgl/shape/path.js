/* jshint esnext: true */

import is  from '../../util/is';
import shapeRendering   from '../../renderer-lib/renderer-bridge';
import boundingFN from './fn-bounding';
import rendererFN from './fn-renderer';
import anchorFN   from './fn-anchors';
import base from './base';

var {isNumber, isString} = is;
var {getShapeProps, getShapeRenderer, anyPropChanged} = shapeRendering;
var {drawPathAnchors} = anchorFN;
var {getPathBoundingClientRect} = boundingFN;
var {hasGradientChanged, renderAnyPath, isHidden, updateAndClearCanvasRect} = rendererFN;
var {drawFill, drawStroke, drawGradientShape} = rendererFN;
var {canvas, getContext, renderShape} = base;
var {max} = Math;


var renderPath = (shp, gl, program, forcedParent) => {

  var shapeProps = getShapeProps(shp);

  // <<< code that varies between text and path
  var getBoundingClientRect = (shp) => {
    var { vertices,  linewidth} = shapeProps;
    return getPathBoundingClientRect(vertices, linewidth);
  };

  var assertShapeChange = (shp) => {
    return hasGradientChanged(shp) || anyPropChanged(shp.parent, ['cap','join','miter']);
  };
  // >>>

  var rendered = renderAnyPath(gl, program, shp, assertShapeChange, getBoundingClientRect, forcedParent, updateShapeCanvas);
  if(rendered) { shp.flagReset(); }
  return shp;

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
  var { vertices,  stroke,  linewidth,  fill,  opacity,  cap,  join,  miter,  closed} = shapeProps;
  var {scale, opacity: rendererOpacity, rect} = renderer;
  opacity = rendererOpacity || opacity;
  linewidth = linewidth * scale;

  // dimensions
  var context = getContext(canvas);
  var {width, height} = updateAndClearCanvasRect(canvas, rect.width, rect.height, scale);

  // Shape properties
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

  drawPathAnchors(canvas, vertices, closed);

  if (!isHidden.test(fill))   context.fill();
  if (!isHidden.test(stroke)) context.stroke();

  context.restore();
};

export default renderPath;
