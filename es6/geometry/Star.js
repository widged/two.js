import _  from '../util/underscore';
import is  from '../util/is';

var TWO_PI = Math.PI * 2, cos = Math.cos, sin = Math.sin;

export default function(ox, oy, or, ir, sides) {

  if (!is.Number(ir)) {
    ir = or / 2;
  }

  if (!is.Number(sides) || sides <= 0) {
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
