/* jshint esnext: true */

import base from './base';
import _  from '../../util/common';

var {mod, toFixed} = _;
var {ctx, isHidden, Commands} = base;

var FN = {};

FN.updatePathAnchors = (anchors) => {
  var next, prev, a, c, ux, uy, vx, vy, ar, bl, br, cl, x, y, d;

  var length = anchors.length;
  var last = length - 1;

  for (var i = 0; i < anchors.length; i++) {

    var b = anchors[i];

    x = toFixed(b._x);
    y = toFixed(b._y);

    switch (b._command) {

      case Commands.close:
        ctx.closePath();
        break;

      case Commands.curve:

        prev = closed ? mod(i - 1, length) : Math.max(i - 1, 0);
        next = closed ? mod(i + 1, length) : Math.min(i + 1, last);

        a = anchors[prev];
        c = anchors[next];
        ar = (a.controls && a.controls.right) || a;
        bl = (b.controls && b.controls.left) || b;

        if (a._relative) {
          vx = toFixed((ar.x + a._x));
          vy = toFixed((ar.y + a._y));
        } else {
          vx = toFixed(ar.x);
          vy = toFixed(ar.y);
        }

        if (b._relative) {
          ux = toFixed((bl.x + b._x));
          uy = toFixed((bl.y + b._y));
        } else {
          ux = toFixed(bl.x);
          uy = toFixed(bl.y);
        }

        ctx.bezierCurveTo(vx, vy, ux, uy, x, y);

        if (i >= last && closed) {

          c = d;

          br = (b.controls && b.controls.right) || b;
          cl = (c.controls && c.controls.left) || c;

          if (b._relative) {
            vx = toFixed((br.x + b._x));
            vy = toFixed((br.y + b._y));
          } else {
            vx = toFixed(br.x);
            vy = toFixed(br.y);
          }

          if (c._relative) {
            ux = toFixed((cl.x + c._x));
            uy = toFixed((cl.y + c._y));
          } else {
            ux = toFixed(cl.x);
            uy = toFixed(cl.y);
          }

          x = toFixed(c._x);
          y = toFixed(c._y);

          ctx.bezierCurveTo(vx, vy, ux, uy, x, y);

        }

        break;

      case Commands.line:
        ctx.lineTo(x, y);
        break;

      case Commands.move:
        d = b;
        ctx.moveTo(x, y);
        break;
    }
  }
  // Loose ends
};

export default FN;
