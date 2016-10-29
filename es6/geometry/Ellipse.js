import is  from '../util/is';
import _  from '../util/common';
import Resolution from '../constant/Resolution';

var {isNumber} = is;

var TWO_PI = Math.PI * 2, cos = Math.cos, sin = Math.sin;

export default function(ox, oy, rx, ry, res) {

	if (!isNumber(ry)) { ry = rx; }

	var amount = res || Resolution;

	var points = _.range(amount).map((i) => {
		var pct = i / amount;
		var theta = pct * TWO_PI;
		var x = rx * cos(theta);
		var y = ry * sin(theta);
		return [x,y];
	});

	return {points, translation: [ox, oy]};

}

