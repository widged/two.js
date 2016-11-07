/* jshint esnext: true */

import is  from '../../lib/is/is';
import rendererBridge   from '../../renderer/renderer-bridge';
import rendererFN from './fn-renderer';
import base from './base';

const {isNumber, isString} = is;
const {getShapeProps, getShapeRenderer, anyPropChanged} = rendererBridge;
const {hasGradientChanged, renderAnyPath, isHidden, updateAndClearCanvasRect} = rendererFN;
const {drawFill, drawStroke} = rendererFN;
const {canvas, getContext, renderShape, drawGradientShape} = base;
const {max} = Math;

var renderText = (shp, gl, program, forcedParent) => {

  var shapeProps = getShapeProps(shp);

  // <<< code that varies between text and path
  var getBoundingClientRect = (shp) => {
    var { stroke, linewidth} = shapeProps;
    var border = (linewidth && !isHidden.test(stroke)) ? linewidth : 0;
    var {ctx,  value,  style,  weight,  size,  leading,  family,  baseline,  alignment} = shapeProps;

    var {width, height} = measureTextDimensions(base.canvas, {value,  style,  weight,  size,  leading,  family,  baseline}); // {ctx, style, weight, size, leading, family, baseline}
    return getTextBoundingClientRect(border, width, height, {alignment, baseline});
  };

  var assertShapeChange = () => {
    return hasGradientChanged || anyPropChanged(shp, ['value','family','size','leading','alignment','baseline','style','weight','decoration']);
  };
  // >>>

  var renderer = renderAnyPath(gl, program, shp, assertShapeChange, getBoundingClientRect, forcedParent, updateShapeCanvas);
  return shp.flagReset();

};

const TEXT_ALIGNMENTS = {
  left: 'start',
  middle: 'center',
  right: 'end'
};

const TEXT_V = {
  bottom: (height, cy) => { return [ -height,      0]; },
  top:    (height, cy) => { return [ 0      , height]; },
  middle: (height, cy) => { return [ -cy    ,     cy]; }
};

const TEXT_H = {
  start:   (width, cx) => { return [ 0     , width]; },
  end:     (width, cx) => { return [ -width,     0]; },
  center:  (width, cx) => { return [ -cx   ,    cx]; }
};

const getTextBoundingClientRect = function(border, width, height, {alignment, baseline}) {
  // width += border; // REVIEW: Not sure if the `measure` calcs
  height += border;

  // REVIEW: centroid x & y
  var centroid = {x: width / 2, y: height / 2};
  var halign = TEXT_ALIGNMENTS[alignment] || alignment;
  var [left, right] = (TEXT_H[halign]   || TEXT_V.center)(width,  centroid.x);
  var [top, bottom] = (TEXT_V[baseline] || TEXT_V.middle)(height, centroid.y);

  // TODO: Gradients aren't inherited...
  return {top, bottom, left, right, width, height, centroid};
};


const measureTextDimensions = (canvas, {value, style, weight, size, leading, family, baseline}) => {
  var width, height;
  var context = getContext(canvas);
  context.font = [style, weight, size + 'px/' + leading + 'px', family].join(' ');
  context.textAlign = 'center';
  context.textBaseline = baseline;
  // TODO: Estimate this better
  width = context.measureText(value).width;
  height = max(size || leading);
  return {width, height};

};


const styleCanvasText = (canvas, {style, weight, size, leading, family}) => {
  var context = getContext(canvas);
  context.font = [style, weight, size + 'px/' + leading + 'px', family].join(' ');
  context.textAlign    = 'center';
  context.textBaseline = 'middle';
};

const updateShapeCanvas = function(shp) {
  var shapeProps = getShapeProps(shp);
  var renderer = getShapeRenderer(shp);
  var {scale, opacity: rendererOpacity, rect} = renderer;
  var { fill,  stroke,  linewidth,  opacity,  style,  weight,  size,  leading,  family,  value} = shapeProps;
  var context = getContext(canvas);

  // dimensions
  var {width, height} = updateAndClearCanvasRect(canvas, rect.width, rect.height, scale);
  // Renderable Styles
  opacity = rendererOpacity || opacity;
  if (isNumber(opacity)) { context.globalAlpha = opacity; }
  // :REVIEW: closure over shape
  var renderGradient = (gdt, context) => {  return drawGradientShape(gdt, context, shp); };
  if (fill)   { drawFill  (canvas, fill  , renderGradient); }
  if (stroke) { drawStroke(canvas, stroke, renderGradient); }
  if (linewidth) { context.lineWidth = linewidth; }
  // Text styles
  styleCanvasText(canvas, {style, weight, size, leading, family});

  // Save and translate
  context.save();
  context.scale(scale, scale);

  var {x, y} = rect.centroid;
  context.translate(x, y);

  if (!isHidden.test(fill))   { context.fillText(value, 0, 0); }
  if (!isHidden.test(stroke)) { context.strokeText(value, 0, 0); }

  context.restore();

};

export default renderText;
