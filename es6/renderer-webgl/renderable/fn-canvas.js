/* jshint esnext: true */

import anchorFN from '../../lib/struct-anchor/anchor-fn';
import Commands from '../../lib/struct-anchor/CommandTypes';
import _    from '../../TwoUtil';
import base from './base';

var {toFixed} = _;
var {getContext} = base;
var {curveSegment} = anchorFN;

var FN = {};

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

        let [vx, vy,  ux, uy] = curveSegment(prv,anchor);
        canvasContext.bezierCurveTo( vx, vy, ux, uy, toFixed(anchor.x), toFixed(anchor.y) );

        if (i === last && closed) {
          let [vx, vy,  ux, uy] = curveSegment(anchor,moveEndpoint);
          canvasContext.bezierCurveTo( vx, vy, ux, uy, toFixed(moveEndpoint.x), toFixed(moveEndpoint.y) );
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
