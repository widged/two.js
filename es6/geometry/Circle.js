/* jshint esnext: true */

import Ellipse from './Ellipse';

var TWO_PI = Math.PI * 2, cos = Math.cos, sin = Math.sin;

export default function(ox, oy, rx, res) {
    return Ellipse(ox, oy, rx, rx, res);
}
