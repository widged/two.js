import _  from '../util/underscore';

var TWO_PI = Math.PI * 2, cos = Math.cos, sin = Math.sin;

export default function(ox, oy, r, sides) {

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


