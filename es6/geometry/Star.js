/* jshint esnext: true */

import _  from '../util/common';
import is  from '../util/is';

var {isNumber} = is;

var TWO_PI = Math.PI * 2, cos = Math.cos, sin = Math.sin;

/**
 * star
 *
 * A star takes a set of x, y coordinates as its origin (the center of the star
 * by default) and or parameter to define the outer radius of the star. Optionally
 * you can define an ir inner radius for the star and sides for how many sides
 * the star has. By default he ir is half the or and there are 5 sides.
 */
export default function(ox, oy, or, ir, sides) {

  if (!isNumber(ir)) {
    ir = or / 2;
  }

  if (!isNumber(sides) || sides <= 0) {
    sides = 5;
  }

  var length = sides * 2;

  var points = [];
  for (var i = 0; i < length; i++) {
    var pct = (i - 0.5) / length;
    var theta = pct * TWO_PI;
    var r = (i % 2 ? ir : or);
    var x = r * cos(theta);
    var y = r * sin(theta);
    points.push([x,y]);
 }

  return {points, translation: [ox, oy]};

}
