/* jshint esnext: true */

import is  from '../util/is';

var {isArray} = is;

var FN = {};


/**
 * A shim for compatibility with matrix math in the various renderers.
 * Use for the shapes for which you have no way to calculate proper
 * bounding boxes
 */
FN.shimBoundingClientRect = (matrix) => {

  var left = Infinity, right = -Infinity,
      top = Infinity, bottom = -Infinity;

  var border, l, x, y, i, v;

  v = matrix.multiply(0, 0, 1);

  return {
    top: v.x,
    left: v.y,
    right: v.x,
    bottom: v.y,
    width: 0,
    height: 0
  };

};

FN.getPathBoundingRect = (matrix, border, length, vertices) => {
  var {min, max} = Math;
  var x, y, i, v;

  var left = Infinity, right = -Infinity,
      top = Infinity, bottom = -Infinity;

  if (length <= 0) {
    v = matrix.multiply(0, 0, 1);
    return {
      top: v.y,
      left: v.x,
      right: v.x,
      bottom: v.y,
      width: 0,
      height: 0
    };
  }

  for (i = 0; i < length; i++) {
    v = vertices[i];

    x = v.x;
    y = v.y;

    v = matrix.multiply(x, y, 1);
    top = min(v.y - border, top);
    left = min(v.x - border, left);
    right = max(v.x + border, right);
    bottom = max(v.y + border, bottom);
  }

  return {
    top: top,
    left: left,
    right: right,
    bottom: bottom,
    width: right - left,
    height: bottom - top
  };
};

FN.rectCentroid = (rect) => { return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; };
FN.rectTopLeft = (rect) => { return { x: rect.left, y: rect.top }; };

export default FN;
