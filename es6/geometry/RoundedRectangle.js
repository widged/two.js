/* jshint esnext: true */

import _  from '../util/common';
import is  from '../util/is';
import Resolution from '../constant/Resolution';

var {isNumber} = is;

/**
 * roundedRectangle
 *
 * A rounded rectangle takes a set of x, y coordinates as its origin (the center
 * of the rounded rectangle by default) and width, height parameters to define
 * the width and height of the rectangle. Lastly, it takes an optional radius
 * number representing the radius of the curve along the corner of the rectangle.
 * radius defaults to 1/12th the of the smaller value between width, height.
 */
function roundedRectangle(ox, oy, width, height, radius) {

    var w2 = width / 2;
    var h2 = height / 2;
    var x, y;

    if (!isNumber(radius)) {
      radius = Math.floor(Math.min(width, height) / 12);
    }

    var points = [
      [- w2 + radius, - h2],
      [w2 - radius, - h2]
    ];

    x = w2;
    y = - h2;
    points = roundCorner(points, x, y, radius, 1);

    points.push([w2, h2 - radius]);

    x = w2;
    y = h2;
    points = roundCorner(points, x, y, radius, 4);

    points.push([- w2 + radius, h2]);

    x = - w2;
    y = h2;
    points = roundCorner(points, x, y, radius, 3);

    points.push([- w2, - h2 + radius]);

    x = - w2;
    y = - h2;
    points = roundCorner(points, x, y, radius, 2);

    points.pop();

    return {points, translation: [ox, oy]};

}


function roundCorner(points, x, y, radius, quadrant) {

  var start = 0, end = 0;
  var length = Resolution;

  var a = points[points.length - 1];
  var b = [x,y];

  var xr = x < 0 ? - radius : radius;
  var yr = y < 0 ? - radius : radius;

  switch (quadrant) {
    case 1:
      start = - Math.PI / 2;
      end = 0;
      break;
    case 2:
      start = - Math.PI;
      end = - Math.PI / 2;
      break;
    case 3:
      start = - Math.PI * 1.5;
      end = - Math.PI;
      break;
    case 4:
      start = 0;
      end = Math.PI / 2;
      break;
  }

  var curve = _.map(_.range(length), function(i) {

    var theta = map(length - i, 0, length, start, end);
    var tx = radius * Math.cos(theta) + x - xr;
    var ty = radius * Math.sin(theta) + y - yr;
    var anchor = [tx, ty];

    return anchor;

  }).reverse();

  return points.concat(curve);

}

function map(v, i1, i2, o1, o2) {
  return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
}

export default roundedRectangle;
