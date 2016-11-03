/* jshint esnext: true */

import _   from '../../util/common';
import is  from '../../util/is';
import base from './base';

var {isDefaultMatrix, renderShape, Commands} = base;

var {mod, toFixed} = _;
var {isString, isNumber} = is;

var path = function(ctx, forced, parentClipped) {

  var matrix, stroke, linewidth, fill, opacity, visible, cap, join, miter,
      closed, commands, length, last, next, prev, a, b, c, d, ux, uy, vx, vy,
      ar, bl, br, cl, x, y, mask, clip, defaultMatrix;

  // TODO: Add a check here to only invoke _update if need be.
  this._update();

  matrix = this._matrix.elements;
  stroke = this._stroke;
  linewidth = this._linewidth;
  fill = this._fill;
  opacity = this._opacity * this.parent._renderer.opacity;
  visible = this._visible;
  cap = this._cap;
  join = this._join;
  miter = this._miter;
  closed = this._closed;
  commands = this._vertices; // Commands
  length = commands.length;
  last = length - 1;
  defaultMatrix = isDefaultMatrix(matrix);

  // mask = this._mask;
  clip = this._clip;

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
  if (miter) {
    ctx.miterLimit = miter;
  }
  if (join) {
    ctx.lineJoin = join;
  }
  if (cap) {
    ctx.lineCap = cap;
  }
  if (isNumber(opacity)) {
    ctx.globalAlpha = opacity;
  }

  ctx.beginPath();

  for (var i = 0; i < commands.length; i++) {

    b = commands[i];

    x = toFixed(b._x);
    y = toFixed(b._y);

    switch (b.command) {

      case Commands.CLOSE:
        ctx.closePath();
        break;

      case Commands.CURVE:

        prev = closed ? mod(i - 1, length) : Math.max(i - 1, 0);
        next = closed ? mod(i + 1, length) : Math.min(i + 1, last);

        a = commands[prev];
        c = commands[next];
        ar = (a.controls && a.controls.right) || a;
        bl = (b.controls && b.controls.left) || b;

        if (a.relative) {
          vx = (ar.x + toFixed(a.x));
          vy = (ar.y + toFixed(a.y));
        } else {
          vx = toFixed(ar.x);
          vy = toFixed(ar.y);
        }

        if (b.relative) {
          ux = (bl.x + toFixed(b.x));
          uy = (bl.y + toFixed(b.y));
        } else {
          ux = toFixed(bl.x);
          uy = toFixed(bl.y);
        }

        ctx.bezierCurveTo(vx, vy, ux, uy, x, y);

        if (i >= last && closed) {

          c = d;

          br = (b.controls && b.controls.right) || b;
          cl = (c.controls && c.controls.left) || c;

          if (b.relative) {
            vx = (br.x + toFixed(b.x));
            vy = (br.y + toFixed(b.y));
          } else {
            vx = toFixed(br.x);
            vy = toFixed(br.y);
          }

          if (c.relative) {
            ux = (cl.x + toFixed(c.x));
            uy = (cl.y + toFixed(c.y));
          } else {
            ux = toFixed(cl.x);
            uy = toFixed(cl.y);
          }

          x = toFixed(c.x);
          y = toFixed(c.y);

          ctx.bezierCurveTo(vx, vy, ux, uy, x, y);

        }

        break;

      case Commands.LINE:
        ctx.lineTo(x, y);
        break;

      case Commands.MOVE:
        d = b;
        ctx.moveTo(x, y);
        break;

    }
  }

  // Loose ends

  if (closed) {
    ctx.closePath();
  }

  if (!clip && !parentClipped) {
    if (!base.isHidden.test(fill)) ctx.fill();
    if (!base.isHidden.test(stroke)) ctx.stroke();
  }

  if (!defaultMatrix) {
    ctx.restore();
  }

  if (clip && !parentClipped) {
    ctx.clip();
  }

  return this.flagReset();

};


export default path;
