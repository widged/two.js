/* jshint esnext: true */

import is  from '../../util/is';
import base from './base';

var {isDefaultMatrix, renderShape, isHidden} = base;

var {isString, isNumber} = is;

const ALIGNMENTS = {
    left: 'start',
    middle: 'center',
    right: 'end'
};


var text = function(ctx, forced, parentClipped) {

  // TODO: Add a check here to only invoke _update if need be.
  this._update();

  var matrix = this._matrix.elements;
  var stroke = this._stroke;
  var linewidth = this._linewidth;
  var fill = this._fill;
  var opacity = this._opacity * this.parent._renderer.opacity;
  var visible = this._visible;
  var defaultMatrix = isDefaultMatrix(matrix);

  // mask = this._mask;
  var clip = this._clip;

  if (!forced && (!visible || clip)) {
    return this;
  }

  // Transform
  if (!defaultMatrix) {
    ctx.save();
    ctx.transform(matrix[0], matrix[3], matrix[1], matrix[4], matrix[2], matrix[5]);
  }

 /**
   * Commented two-way functionality of clips / masks with groups and
   * polygons. Uncomment when this bug is fixed:
   * https://code.google.com/p/chromium/issues/detail?id=370951
   */

  // if (mask) {
  //   renderShape(mask, ctx, true);
  // }

  ctx.font = [this._style, this._weight, this._size + 'px/' +
    this._leading + 'px', this._family].join(' ');

  ctx.textAlign = ALIGNMENTS[this._alignment] || this._alignment;
  ctx.textBaseline = this._baseline;

  // Styles
  if (fill) {
    if (isString(fill)) {
      ctx.fillStyle = fill;
    } else {
      renderShape(fill, ctx);
      ctx.fillStyle = fill._renderer.gradient;
    }
  }
  if (stroke) {
    if (isString(stroke)) {
      ctx.strokeStyle = stroke;
    } else {
      renderShape(stroke, ctx);
      ctx.strokeStyle = stroke._renderer.gradient;
    }
  }
  if (linewidth) {
    ctx.lineWidth = linewidth;
  }
  if (isNumber(opacity)) {
    ctx.globalAlpha = opacity;
  }


  if (!clip && !parentClipped) {
    if (!isHidden.test(fill)) ctx.fillText(this._value, 0, 0);
    if (!isHidden.test(stroke)) ctx.strokeText(this._value, 0, 0);
  }

  if (!defaultMatrix) {
    ctx.restore();
  }

  // TODO: Test for text
  if (clip && !parentClipped) {
    ctx.clip();
  }

  return this.flagReset();

};


export default text;
