/* jshint esnext: true */

import is  from '../../util/is';
import shapeRendering   from '../../shape-rendering';
import boundingFN from './fn-bounding';
import rendererFN from './fn-renderer';
import anchorFN   from './fn-anchors';
import base from './base';

var {isNumber, isString} = is;
var {getShapeProps, getShapeRenderer, updateShape, anyPropChanged} = shapeRendering;
var {getTextBoundingClientRect} = boundingFN;
var {hasGradientChanged, renderPath, isHidden, updateAndClearCanvasRect} = rendererFN;
var {drawFill, drawStroke} = rendererFN;
var {canvas, getContext, renderShape, drawGradientShape} = base;
var {max} = Math;

var styleCanvasText = (canvas, {style, weight, size, leading, family}) => {
  var context = getContext(canvas);
  context.font = [style, weight, size + 'px/' + leading + 'px', family].join(' ');
  context.textAlign    = 'center';
  context.textBaseline = 'middle';
};

var updateShapeCanvas = function(shp) {
  var renderer = getShapeRenderer(shp);
  var {scale, opacity: rendererOpacity, rect} = renderer;
  var { fill,  stroke,  linewidth,  opacity,  style,  weight,  size,  leading,  family,  value} = getShapeProps(shp,
      ["fill","stroke","linewidth","opacity","style","weight","size","leading","family","value"]);
  var context = getContext(canvas);

  // dimensions
  var {width, height} = updateAndClearCanvasRect(canvas, rect.width, rect.height, scale);
  // Shape Styles
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

var text = {

  render: function(shp, gl, program, forcedParent) {

    // <<< code that varies between text and path
    var getBoundingClientRect = (shp) => {
      var { stroke, linewidth} = getShapeProps( shp, ["stroke","linewidth"] );
      var border = (linewidth && !isHidden.test(stroke)) ? linewidth : 0;
      var {ctx,  value,  style,  weight,  size,  leading,  family,  baseline,  alignment} = getShapeProps( shp,
         ["ctx","value","style","weight","size","leading","family","baseline","alignment"] );

      var {width, height} = measureTextDimensions(base.canvas, {value,  style,  weight,  size,  leading,  family,  baseline}); // {ctx, style, weight, size, leading, family, baseline}
      return getTextBoundingClientRect(border, width, height, {alignment, baseline});
    };

    var assertShapeChange = () => {
      return hasGradientChanged || anyPropChanged(shp, ['value','family','size','leading','alignment','baseline','style','weight','decoration']);
    };

    // >>>

    var renderer = renderPath(gl, program, shp, assertShapeChange, getBoundingClientRect, forcedParent, updateShapeCanvas);
    return shp.flagReset();

  }

};

var measureTextDimensions = (canvas, {value, style, weight, size, leading, family, baseline}) => {
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


export default text;
