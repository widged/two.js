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

exports['default'] = function (ox, oy, r, sides) {

  sides = Math.max(sides || 0, 3);

  var points = _utilUtils2['default'].map(_utilUtils2['default'].range(sides), function (i) {
    var pct = (i + 0.5) / sides;
    var theta = TWO_PI * pct + Math.PI / 2;
    var x = r * cos(theta);
    var y = r * sin(theta);
    return [x, y];
  });

  return { points: points, translation: [ox, oy] };
};

module.exports = exports['default'];