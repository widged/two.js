'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilUtils = require('../util/utils');

var _utilUtils2 = _interopRequireDefault(_utilUtils);

var _constantResolution = require('../constant/Resolution');

var _constantResolution2 = _interopRequireDefault(_constantResolution);

function roundedRectangle(ox, oy, width, height, radius) {

  var w2 = width / 2;
  var h2 = height / 2;
  var x, y;

  if (!_utilUtils2['default'].isNumber(radius)) {
    radius = Math.floor(Math.min(width, height) / 12);
  }

  var points = [[-w2 + radius, -h2], [w2 - radius, -h2]];

  x = w2;
  y = -h2;
  points = roundCorner(points, x, y, radius, 1);

  points.push([w2, h2 - radius]);

  x = w2;
  y = h2;
  points = roundCorner(points, x, y, radius, 4);

  points.push([-w2 + radius, h2]);

  x = -w2;
  y = h2;
  points = roundCorner(points, x, y, radius, 3);

  points.push([-w2, -h2 + radius]);

  x = -w2;
  y = -h2;
  points = roundCorner(points, x, y, radius, 2);

  points.pop();

  return { points: points, translation: [ox, oy] };
}

function roundCorner(points, x, y, radius, quadrant) {

  var start = 0,
      end = 0;
  var length = _constantResolution2['default'];

  var a = points[points.length - 1];
  var b = [x, y];

  var xr = x < 0 ? -radius : radius;
  var yr = y < 0 ? -radius : radius;

  switch (quadrant) {
    case 1:
      start = -Math.PI / 2;
      end = 0;
      break;
    case 2:
      start = -Math.PI;
      end = -Math.PI / 2;
      break;
    case 3:
      start = -Math.PI * 1.5;
      end = -Math.PI;
      break;
    case 4:
      start = 0;
      end = Math.PI / 2;
      break;
  }

  var curve = _utilUtils2['default'].map(_utilUtils2['default'].range(length), function (i) {

    var theta = map(length - i, 0, length, start, end);
    var tx = radius * Math.cos(theta) + x - xr;
    var ty = radius * Math.sin(theta) + y - yr;
    var anchor = [tx, ty];

    return anchor;
  }).reverse();

  return points.concat(curve);
}

function map(v, i1, i2, o1, o2) {
  return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
}

exports['default'] = roundedRectangle;
module.exports = exports['default'];