/* jshint esnext: true */

import util from '../../TwoUtil';

const {min, max} = Math;
const {toFixed} = util;

const FN = {};

FN.rectCentroid = (rect) => { return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; };
FN.rectTopLeft = (rect) => { return { x: rect.left, y: rect.top }; };


/**
 * A shim for compatibility with matrix math in the various renderers.
 * Use for the shapes for which you have no way to calculate proper
 * bounding boxes
 */
FN.shimBoundingClientRect = ({x,y}) => {

  return {
    top: x,
    left: y,
    right: x,
    bottom: y,
    width: 0,
    height: 0
  };

};


/**
 * Updates a Rect to include an additional anchor. Typically takes anchors that are
 * "centered" around 0 and returns them to be anchored upper-left.
 */
FN.includePointInBoundingRect = (rect, {x,y,controls, relative}) => {
  if(!rect) { rect = {left : Infinity, right : -Infinity, top : Infinity, bottom : -Infinity}; }
  var changed;
  if (controls) {
    var cl = controls.left,
        cr = controls.right;

    let a, b, c, d;
    if (cl && cr) {
      a = relative ? cl.x + x : cl.x;
      b = relative ? cl.y + y : cl.y;
      c = relative ? cr.x + x : cr.x;
      d = relative ? cr.y + y : cr.y;
    }

    if (a && b && c && d) {
      changed = true;
      rect.top    = min(b, d, rect.top);
      rect.left   = min(a, c, rect.left);
      rect.right  = max(a, c, rect.right);
      rect.bottom = max(b, d, rect.bottom);
    }
  }

  if(!changed) {
    rect.top    = min(y || Infinity, rect.top);
    rect.left   = min(x || Infinity, rect.left);
    rect.right  = max(x || -Infinity, rect.right);
    rect.bottom = max(y || -Infinity, rect.bottom);
  }

  return rect;
};


FN.removeRectBorder = (rect, border) => {
  var top    = toFixed(rect.top - border);
  var left   = toFixed(rect.left - border);
  var right  = toFixed(rect.right + border);
  var bottom = toFixed(rect.bottom + border);
  return {
    top, left, right, bottom,
    width: toFixed(right - left),
    height: toFixed(bottom - top)
  };
}



export default FN;
