/* jshint esnext: true */

/**
 * makeRectangle two.makeRectangle(x, y, width, height);
 *
 * Draws a rectangle to the instance's drawing space where x, y are the x, y
 * values for the center point of the rectangle and width, height represents the
 * width and height of the rectangle.
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
