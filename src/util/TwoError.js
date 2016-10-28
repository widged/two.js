// Custom Error Throwing for Two.js

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function TwoError(message) {
  this.name = 'two.js';
  this.message = message;
}

TwoError.prototype = new Error();
TwoError.prototype.constructor = TwoError;

exports['default'] = TwoError;
module.exports = exports['default'];