'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilUtils = require('../util/utils');

var _utilUtils2 = _interopRequireDefault(_utilUtils);

var _constantResolution = require('../constant/Resolution');

var _constantResolution2 = _interopRequireDefault(_constantResolution);

var TWO_PI = Math.PI * 2,
    cos = Math.cos,
    sin = Math.sin;

exports['default'] = function (ox, oy, rx, ry, res) {

	if (!_utilUtils2['default'].isNumber(ry)) {
		ry = rx;
	}

	var amount = res || _constantResolution2['default'];

	var points = _utilUtils2['default'].range(amount).map(function (i) {
		var pct = i / amount;
		var theta = pct * TWO_PI;
		var x = rx * cos(theta);
		var y = ry * sin(theta);
		return [x, y];
	});

	return { points: points, translation: [ox, oy] };
};

module.exports = exports['default'];