/* jshint esnext: true */

import Ellipse from './Ellipse';

/**
 * makeCircle two.makeCircle(x, y, radius);
 *
 * Draws a circle to the instance's drawing space where x, y are the x, y values
 * for the center point of the circle and radius is the radius of the circle.
 */
export default function(ox, oy, rx, res) {
    return Ellipse(ox, oy, rx, rx, res);
}
