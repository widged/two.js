/* jshint esnext: true */

import is  from '../../lib/is/is';
import Resolution from '../Resolution';

const {isNumber} = is;
const {cos, sin, PI} = Math;
const TWO_PI = PI * 2;

/**
 * ellipse
 *
 * An ellipse takes a set of x, y coordinates as its origin (the center of the
 * ellipse by default) and width, height parameters to define the width and
 * height of the ellipse.
 */
export default function(ox, oy, rx, ry, res) {

	if (!isNumber(ry)) { ry = rx; }

	var amount = res || Resolution;

	var points = [];
  for (var i = 0; i < amount; i++) {
		var pct = i / amount;
		var theta = pct * TWO_PI;
		var x = rx * cos(theta);
		var y = ry * sin(theta);
		points.push([x,y]);
	}

	return {points, translation: [ox, oy]};

}
