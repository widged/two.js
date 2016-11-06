/* jshint esnext: true */

/**
 * polygon
 *
 * A polygon takes a set of x, y coordinates as its origin (the center of the
 * polygon by default) and radius, sides parameters to define the radius of the
 * polygon and how many sides the polygon has. By default there are 3 sides,
 * a triangle.
 */
export default function(ox, oy, r, sides) {

  var TWO_PI = Math.PI * 2, cos = Math.cos, sin = Math.sin;

  sides = Math.max(sides || 0, 3);

  var points = [];
  for (var i = 0; i < sides; i++) {
    var pct = (i + 0.5) / sides;
    var theta = TWO_PI * pct + Math.PI / 2;
    var x = r * cos(theta);
    var y = r * sin(theta);
    points.push([x, y]);
  }

  return {points, translation: [ox, oy]};

}
