"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Manager = function Manager() {

  var count = 0;

  return function () {
    var id = count;
    count++;
    return id;
  };
};

exports["default"] = Manager;
module.exports = exports["default"];