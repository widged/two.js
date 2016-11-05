/* jshint esnext: true */

import _   from '../../util/common';
import is  from '../../util/is';
import base from './base';
import shapeRendering   from '../../renderer-lib/renderer-bridge';

var {anyPropChanged, getShapeProps, getShapeRenderer} = shapeRendering;
var {isDefaultMatrix, renderShape, Commands} = base;

var {mod, toFixed} = _;
var {isString, isNumber} = is;

var path = function(shp, ctx, forced, parentClipped) {

  var renderer = getShapeRenderer(shp);
  var parentRenderer = getShapeRenderer(shp.parent);

  var matrixElem, anchors, length, last, next, prev, a, b, c, d, ux, uy, vx, vy,
      ar, bl, br, cl, x, y, defaultMatrix;

  var { stroke,  linewidth,  fill,  opacity,  visible,  clip,  mask  } = getShapeProps(shp,
      ['stroke','linewidth','fill','opacity','visible','clip','mask']);
  var { matrix,  vertices,  closed } = getShapeProps(shp, ['matrix','vertices','closed']);
  var { cap,  join,  miter  } = getShapeProps(shp, ['cap','join','miter','closed']);

  opacity = opacity * parentRenderer.opacity;
  anchors = vertices; // Commands

  length = anchors.length;
  last = length - 1;

  if (!forced && (!visible || clip)) { return shp; }

  // Transform
  matrixElem = matrix.elements;
  defaultMatrix = isDefaultMatrix(matrixElem);
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

  for (var i = 0; i < anchors.length; i++) {

    b = anchors[i];

    x = toFixed(b.x);
    y = toFixed(b.y);

    switch (b.command) {

      case Commands.CLOSE:
        ctx.closePath();
        break;

      case Commands.CURVE:

        prev = closed ? mod(i - 1, length) : Math.max(i - 1, 0);
        next = closed ? mod(i + 1, length) : Math.min(i + 1, last);

        a = anchors[prev];
        c = anchors[next];
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

  return shp.flagReset();

};


export default path;
