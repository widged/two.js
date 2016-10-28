'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Ellipse = require('./Ellipse');

var _Ellipse2 = _interopRequireDefault(_Ellipse);

var TWO_PI = Math.PI * 2,
    cos = Math.cos,
    sin = Math.sin;

exports['default'] = function (ox, oy, rx, res) {
    return (0, _Ellipse2['default'])(ox, oy, rx, rx, res);
};

module.exports = exports['default'];