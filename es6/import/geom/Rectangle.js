/* jshint esnext: true */

/**
 * makeRectangle two.makeRectangle(x, y, width, height);
 *
 * A rectangle takes a set of x, y coordinates as its origin (the center of the
 * rectangle by default) and width, height parameters to define the width and
 * height of the rectangle.
 */
export default function(ox, oy, width, height) {

	var w2 = width / 2;
	var h2 = height / 2;

	var points = [
	  [-w2, -h2],
	  [w2, -h2],
	  [w2, h2],
	  [-w2, h2]
	];

    return {points, translation: [ox, oy]};

}
