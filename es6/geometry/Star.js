/* jshint esnext: true */

import _  from '../util/common';
import is  from '../util/is';

var {isNumber} = is;

var TWO_PI = Math.PI * 2, cos = Math.cos, sin = Math.sin;

/**
 * makeStar two.makeStar(ox, oy, or, ir, sides);
 *
 * Draws a star to the instance's drawing space where ox, oy are the x, y values
 * for the center point of the star and or, ir are the outer and inner radii for
 * the star, and sides are how many points the star has.
 */
export default function(ox, oy, or, ir, sides) {

  if (!isNumber(ir)) {
    ir = or / 2;
  }

  if (!isNumber(sides) || sides <= 0) {
    sides = 5;
  }

  var length = sides * 2;

  var points = _.map(_.range(length), function(i) {
    var pct = (i - 0.5) / length;
    var theta = pct * TWO_PI;
    var r = (i % 2 ? ir : or);
    var x = r * cos(theta);
    var y = r * sin(theta);
    return [x,y];
  });

  return {points, translation: [ox, oy]};

}
