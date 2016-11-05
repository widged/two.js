/* jshint esnext: true */

import is  from '../../util/is';
import base from './base';
import shapeRendering   from '../../renderer-lib/renderer-bridge';

var {anyPropChanged, getShapeProps, getShapeRenderer} = shapeRendering;
var {isDefaultMatrix, renderShape, isHidden} = base;

var {isString, isNumber} = is;

const ALIGNMENTS = {
    left: 'start',
    middle: 'center',
    right: 'end'
};


var renderText = (shp, ctx, forced, parentClipped) => {

  var renderer = getShapeRenderer(shp);
  var parentRenderer = getShapeRenderer(shp.parent);

  var { stroke,  linewidth,  fill,  opacity,  visible,  clip,  mask  } = getShapeProps(shp,
      ['stroke','linewidth','fill','opacity','visible','clip','mask']);
  var { matrix,  vertices,  closed } = getShapeProps(shp, ['matrix','vertices','closed']);

  opacity = opacity * parentRenderer.opacity;
  var anchors = vertices; // Commands

  if (!forced && (!visible || clip)) { return shp; }

  // Transform
  var matrixElem = matrix.elements;
  var defaultMatrix = isDefaultMatrix(matrixElem);
  if (!defaultMatrix) {
    ctx.save();
    ctx.transform(matrixElem[0], matrixElem[3], matrixElem[1], matrixElem[4], matrixElem[2], matrixElem[5]);
  }

 /**
   * Commented two-way functionality of clips / masks with groups and
   * polygons. Uncomment when that bug is fixed:
   * https://code.google.com/p/chromium/issues/detail?id=370951
   */

  // if (mask) {
  //   renderShape(mask, ctx, true);
  // }

  var { font,  style,  weight , size , leading , family , alignment , baseline , value  } = getShapeProps(shp,
      ['font','style','weight','size','leading','family','alignment','baseline','value']);

  ctx.font = [style, weight, size + 'px/' + leading + 'px', family].join(' ');

  ctx.textAlign = ALIGNMENTS[alignment] || alignment;
  ctx.textBaseline = baseline;

  // Styles
  if (fill) {
    if (isString(fill)) {
      ctx.fillStyle = fill;
    } else {
      renderShape(fill, ctx);
      var fillR = getShapeRenderer(fill);
      ctx.fillStyle = fillR.gradient;
    }
  }
  if (stroke) {
    if (isString(stroke)) {
      ctx.strokeStyle = stroke;
    } else {
      renderShape(stroke, ctx);
      var strokeR = getShapeRenderer(fill);
      ctx.strokeStyle = strokeR.gradient;
    }
  }
  if (linewidth) {
    ctx.lineWidth = linewidth;
  }
  if (isNumber(opacity)) {
    ctx.globalAlpha = opacity;
  }


  if (!clip && !parentClipped) {
    if (!isHidden.test(fill)) ctx.fillText(value, 0, 0);
    if (!isHidden.test(stroke)) ctx.strokeText(value, 0, 0);
  }

  if (!defaultMatrix) {
    ctx.restore();
  }

  // TODO: Test for text
  if (clip && !parentClipped) {
    ctx.clip();
  }

  return shp.flagReset();

};


export default renderText;
