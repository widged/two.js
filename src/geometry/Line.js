"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (x1, y1, x2, y2) {

  var width = x2 - x1;
  var height = y2 - y1;

  var w2 = width / 2;
  var h2 = height / 2;

  var points = [[-w2, -h2], [w2, h2]];

  return { points: points, translation: [x1 + w2, y1 + h2] };
};

;
module.exports = exports["default"];