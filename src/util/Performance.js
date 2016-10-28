"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = global.performance && global.performance.now ? global.performance : Date;
module.exports = exports["default"];