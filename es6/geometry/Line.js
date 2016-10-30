/* jshint esnext: true */

/**
 * makeLine two.makeLine(x1, y1, x2, y2);
 *
 * Draws a line between two coordinates to the instance's drawing space where x1, y1
 * are the x, y values for the first coordinate and x2, y2 are the x, y values for
 * the second coordinate.
 */
export default function(x1, y1, x2, y2) {

  var width = x2 - x1;
  var height = y2 - y1;

  var w2 = width / 2;
  var h2 = height / 2;

  var points = [
      [- w2, - h2],
      [w2, h2]
  ];

  return {points, translation: [x1 + w2, y1 + h2]};

}
