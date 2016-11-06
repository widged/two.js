/* jshint esnext: true */

import Commands from '../../lib/struct-anchor/CommandTypes';
import _    from '../../TwoUtil';
import base from './base';

var {toFixed} = _;
var {getContext} = base;

var FN = {};

var relativePoint = (p, pr) => {

};

var curveSegment = (a, b) => {
  var ar, bl, vx, vy, ux, uy;
  ar = (a.controls && a.controls.right) || a;
  bl = (b.controls && b.controls.left) || b;

  if (a.relative) {
    vx = toFixed((ar.x + a.x));
    vy = toFixed((ar.y + a.y));
  } else {
    vx = toFixed(ar.x);
    vy = toFixed(ar.y);
  }

  if (b.relative) {
    ux = toFixed((bl.x + b.x));
    uy = toFixed((bl.y + b.y));
  } else {
    ux = toFixed(bl.x);
    uy = toFixed(bl.y);
  }
  return [vx, vy, ux, uy];
};

var drawCurve = (canvasContext, a, b) => {
  var [vx, vy,  ux, uy] = curveSegment(a,b);
  canvasContext.bezierCurveTo(
    vx, vy, ux, uy,
    toFixed(b.x),
    toFixed(b.y)
  );

};

FN.drawPathAnchors = (canvas, anchors, closed) => {

  var canvasContext = getContext(canvas);

  var iprv, prv, moveEndpoint;

  var length = anchors.length;
  var last = length - 1;

  canvasContext.beginPath();
  for (var i = 0, ni = anchors.length, anchor = null; i < ni; i++) {

    anchor = anchors[i];

    switch (anchor.command) {

      case Commands.CLOSE:
        canvasContext.closePath();
        break;

      case Commands.CURVE:
        // :NOTE: check simplified
        iprv = (closed && i === 0) ? last : Math.max(i - 1, 0);
        prv = anchors[iprv];

        drawCurve(canvasContext, prv, anchor);
        if (i === last && closed) {
          drawCurve(canvasContext, anchor, moveEndpoint);
        }
        break;

      case Commands.LINE:
        canvasContext.lineTo(
          toFixed(anchor.x),
          toFixed(anchor.y)
        );
        break;

      case Commands.MOVE:
        moveEndpoint = anchor;
        canvasContext.moveTo(
          toFixed(anchor.x),
          toFixed(anchor.y)
        );
        break;
    }
  }
  if (closed) { canvasContext.closePath(); }
  // Loose ends
};

export default FN;
