/* jshint esnext: true */

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
