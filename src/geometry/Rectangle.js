"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports["default"] = function (ox, oy, width, height) {

	var w2 = width / 2;
	var h2 = height / 2;

	var points = [[-w2, -h2], [w2, -h2], [w2, h2], [-w2, h2]];

	return { points: points, translation: [ox, oy] };
};

module.exports = exports["default"];