'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _constantCommandTypes = require('../constant/CommandTypes');

var _constantCommandTypes2 = _interopRequireDefault(_constantCommandTypes);

var PI = Math.PI,
    TWO_PI = Math.PI * 2,
    cos = Math.cos,
    sin = Math.sin,
    abs = Math.abs;

function sineRing(ox, oy, r, periods, amplitude, mod) {

  var size = periods * 2 + 1;
  var angleStep = Math.PI / periods;
  var bezierDelta = PI * r / periods / 2;
  mod = mod || 1;

  var points = [];
  var theta = PI,
      x,
      y,
      lx,
      ly,
      rx,
      ry;

  points.push([sin(theta) * (r + amplitude / 2), cos(theta) * (r + amplitude / 2), 0, 0, 0, 0, _constantCommandTypes2['default'].move]);

  for (var i = 0; i < size; i++) {

    theta = angleStep * i + PI;

    if (i % 2 === 0) {
      x = Math.sin(theta) * (r + amplitude / 2);
      y = Math.cos(theta) * (r + amplitude / 2);
    } else {
      x = Math.sin(theta) * (r - amplitude / 2);
      y = Math.cos(theta) * (r - amplitude / 2);
    }

    lx = Math.sin(theta - Math.PI / 2) * bezierDelta * mod;
    ly = Math.cos(theta - Math.PI / 2) * bezierDelta * mod;
    rx = Math.sin(theta + Math.PI / 2) * bezierDelta * mod;
    ry = Math.cos(theta + Math.PI / 2) * bezierDelta * mod;

    if (i === 0) {
      lx = ly = 0;
    }

    if (i === size - 1) {
      rx = ry = 0;
    }

    points.push([x, y, lx, ly, rx, ry, _constantCommandTypes2['default'].curve]);
  }
  return { points: points, translation: [ox, oy] };
}

exports['default'] = sineRing;
module.exports = exports['default'];