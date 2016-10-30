/* jshint esnext: true */

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
