'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilUtils = require('../util/utils');

var _utilUtils2 = _interopRequireDefault(_utilUtils);

var TWO_PI = Math.PI * 2,
    cos = Math.cos,
    sin = Math.sin;

exports['default'] = function (ox, oy, or, ir, sides) {

  if (!_utilUtils2['default'].isNumber(ir)) {
    ir = or / 2;
  }

  if (!_utilUtils2['default'].isNumber(sides) || sides <= 0) {
    sides = 5;
  }

  var length = sides * 2;

  var points = _utilUtils2['default'].map(_utilUtils2['default'].range(length), function (i) {
    var pct = (i - 0.5) / length;
    var theta = pct * TWO_PI;
    var r = i % 2 ? ir : or;
    var x = r * cos(theta);
    var y = r * sin(theta);
    return [x, y];
  });

  return { points: points, translation: [ox, oy] };
};

module.exports = exports['default'];