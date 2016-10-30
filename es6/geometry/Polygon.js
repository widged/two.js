/* jshint esnext: true */

import _  from '../util/common';

/**
 * makePolygon two.makePolygon(ox, oy, r, sides);
 *
 * Draws a polygon to the instance's drawing space where ox, oy are the x, y
 * values for the center of the polygon, r is the radius, and sides are how many
 * sides the polygon has.
 */
export default function(ox, oy, r, sides) {

  var TWO_PI = Math.PI * 2, cos = Math.cos, sin = Math.sin;

  sides = Math.max(sides || 0, 3);

  var points = _.map(_.range(sides), function(i) {
    var pct = (i + 0.5) / sides;
    var theta = TWO_PI * pct + Math.PI / 2;
    var x = r * cos(theta);
    var y = r * sin(theta);
    return [x, y];
  });

  return {points, translation: [ox, oy]};

}
