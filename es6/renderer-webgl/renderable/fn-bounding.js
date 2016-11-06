/* jshint esnext: true */

import is  from '../../util/is';

var {isNumber} = is;
var {min, max} = Math;
var FN = {};

// --------------------
// Text Bounding Rect
// --------------------

const TEXT_ALIGNMENTS = {
  left: 'start',
  middle: 'center',
  right: 'end'
};

var TEXT_V = {
  bottom: (height, cy) => { return [ -height,      0]; },
  top:    (height, cy) => { return [ 0      , height]; },
  middle: (height, cy) => { return [ -cy    ,     cy]; }
};

var TEXT_H = {
  start:   (width, cx) => { return [ 0     , width]; },
  end:     (width, cx) => { return [ -width,     0]; },
  center:  (width, cx) => { return [ -cx   ,    cx]; }
};

FN.getTextBoundingClientRect = function(border, width, height, {alignment, baseline}) {
  // width += border; // REVIEW: Not sure if the `measure` calcs
  height += border;

  // REVIEW: centroid x & y
  var centroid = {x: width / 2, y: height / 2};
  var halign = TEXT_ALIGNMENTS[alignment] || alignment;
  var [left, right] = (TEXT_H[halign]   || TEXT_V.center)(width,  centroid.x);
  var [top, bottom] = (TEXT_V[baseline] || TEXT_V.middle)(height, centroid.y);

  // TODO: Gradients aren't inherited...
  return {top, bottom, left, right, width, height, centroid};
};


// --------------------
// Path Bounding Rect
// --------------------

/**
 * Returns the rect of a set of verts. Typically takes vertices that are
 * "centered" around 0 and returns them to be anchored upper-left.
 */
FN.getPathBoundingClientRect = function(vertices, border) { // border is shape linewidth

  var left = Infinity, right = -Infinity,
      top = Infinity, bottom = -Infinity,
      width, height, centroid;

  vertices.forEach(function({x,y,controls,_relative:relative}) {

    var a, b, c, d;

    if (controls) {
      var cl = controls.left,
          cr = controls.right;

      if (cl && cr) {
        a = relative ? cl.x + x : cl.x;
        b = relative ? cl.y + y : cl.y;
        c = relative ? cr.x + x : cr.x;
        d = relative ? cr.y + y : cr.y;
      }
    }

    if (a && b && c && d) {
      top    = min(b, d, top);
      left   = min(a, c, left);
      right  = max(a, c, right);
      bottom = max(b, d, bottom);
    } else {
      top    = min(y, top);
      left   = min(x, left);
      right  = max(x, right);
      bottom = max(y, bottom);
    }

  });

  // Expand borders
  if (isNumber(border)) {
    top    = top - border;
    left   = left - border;
    right  = right + border;
    bottom = bottom + border;
  }

  width  = right - left;
  height = bottom - top;

  centroid = {x: - left, y: - top};

  return {top, left, right, bottom, width, height, centroid};

};

export default FN;
