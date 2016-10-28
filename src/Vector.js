'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilUnderscore = require('./util/underscore');

var _utilUnderscore2 = _interopRequireDefault(_utilUnderscore);

var _utilUtils = require('./util/utils');

var _utilUtils2 = _interopRequireDefault(_utilUtils);

var _utilEventsDecoratorJs = require('./util/eventsDecorator.js');

var _utilEventsDecoratorJs2 = _interopRequireDefault(_utilEventsDecoratorJs);

var _constantEventTypes = require('./constant/EventTypes');

var _constantEventTypes2 = _interopRequireDefault(_constantEventTypes);

var extend = _utilUnderscore2['default'].extend;

var Vector = function Vector(x, y) {

  this.x = x || 0;
  this.y = y || 0;
};

Vector.zero = new Vector();
extend(Vector.prototype, _utilEventsDecoratorJs2['default']);

extend(Vector.prototype, {

  set: function set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  },

  copy: function copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  },

  clear: function clear() {
    this.x = 0;
    this.y = 0;
    return this;
  },

  clone: function clone() {
    return new Vector(this.x, this.y);
  },

  add: function add(v1, v2) {
    this.x = v1.x + v2.x;
    this.y = v1.y + v2.y;
    return this;
  },

  addSelf: function addSelf(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  },

  sub: function sub(v1, v2) {
    this.x = v1.x - v2.x;
    this.y = v1.y - v2.y;
    return this;
  },

  subSelf: function subSelf(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  },

  multiplySelf: function multiplySelf(v) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  },

  multiplyScalar: function multiplyScalar(s) {
    this.x *= s;
    this.y *= s;
    return this;
  },

  divideScalar: function divideScalar(s) {
    if (s) {
      this.x /= s;
      this.y /= s;
    } else {
      this.set(0, 0);
    }
    return this;
  },

  negate: function negate() {
    return this.multiplyScalar(-1);
  },

  dot: function dot(v) {
    return this.x * v.x + this.y * v.y;
  },

  lengthSquared: function lengthSquared() {
    return this.x * this.x + this.y * this.y;
  },

  length: function length() {
    return Math.sqrt(this.lengthSquared());
  },

  normalize: function normalize() {
    return this.divideScalar(this.length());
  },

  distanceTo: function distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v));
  },

  distanceToSquared: function distanceToSquared(v) {
    var dx = this.x - v.x,
        dy = this.y - v.y;
    return dx * dx + dy * dy;
  },

  setLength: function setLength(l) {
    return this.normalize().multiplyScalar(l);
  },

  equals: function equals(v, eps) {
    eps = typeof eps === 'undefined' ? 0.0001 : eps;
    return this.distanceTo(v) < eps;
  },

  lerp: function lerp(v, t) {
    var x = (v.x - this.x) * t + this.x;
    var y = (v.y - this.y) * t + this.y;
    return this.set(x, y);
  },

  isZero: function isZero(eps) {
    eps = typeof eps === 'undefined' ? 0.0001 : eps;
    return this.length() < eps;
  },

  toString: function toString() {
    return this.x + ',' + this.y;
  },

  toObject: function toObject() {
    return { x: this.x, y: this.y };
  }

});

var BoundProto = {

  set: function set(x, y) {
    this._x = x;
    this._y = y;
    return this.trigger(_constantEventTypes2['default'].change);
  },

  copy: function copy(v) {
    this._x = v.x;
    this._y = v.y;
    return this.trigger(_constantEventTypes2['default'].change);
  },

  clear: function clear() {
    this._x = 0;
    this._y = 0;
    return this.trigger(_constantEventTypes2['default'].change);
  },

  clone: function clone() {
    return new Vector(this._x, this._y);
  },

  add: function add(v1, v2) {
    this._x = v1.x + v2.x;
    this._y = v1.y + v2.y;
    return this.trigger(_constantEventTypes2['default'].change);
  },

  addSelf: function addSelf(v) {
    this._x += v.x;
    this._y += v.y;
    return this.trigger(_constantEventTypes2['default'].change);
  },

  sub: function sub(v1, v2) {
    this._x = v1.x - v2.x;
    this._y = v1.y - v2.y;
    return this.trigger(_constantEventTypes2['default'].change);
  },

  subSelf: function subSelf(v) {
    this._x -= v.x;
    this._y -= v.y;
    return this.trigger(_constantEventTypes2['default'].change);
  },

  multiplySelf: function multiplySelf(v) {
    this._x *= v.x;
    this._y *= v.y;
    return this.trigger(_constantEventTypes2['default'].change);
  },

  multiplyScalar: function multiplyScalar(s) {
    this._x *= s;
    this._y *= s;
    return this.trigger(_constantEventTypes2['default'].change);
  },

  divideScalar: function divideScalar(s) {
    if (s) {
      this._x /= s;
      this._y /= s;
      return this.trigger(_constantEventTypes2['default'].change);
    }
    return this.clear();
  },

  negate: function negate() {
    return this.multiplyScalar(-1);
  },

  dot: function dot(v) {
    return this._x * v.x + this._y * v.y;
  },

  lengthSquared: function lengthSquared() {
    return this._x * this._x + this._y * this._y;
  },

  length: function length() {
    return Math.sqrt(this.lengthSquared());
  },

  normalize: function normalize() {
    return this.divideScalar(this.length());
  },

  distanceTo: function distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v));
  },

  distanceToSquared: function distanceToSquared(v) {
    var dx = this._x - v.x,
        dy = this._y - v.y;
    return dx * dx + dy * dy;
  },

  setLength: function setLength(l) {
    return this.normalize().multiplyScalar(l);
  },

  equals: function equals(v, eps) {
    eps = typeof eps === 'undefined' ? 0.0001 : eps;
    return this.distanceTo(v) < eps;
  },

  lerp: function lerp(v, t) {
    var x = (v.x - this._x) * t + this._x;
    var y = (v.y - this._y) * t + this._y;
    return this.set(x, y);
  },

  isZero: function isZero(eps) {
    eps = typeof eps === 'undefined' ? 0.0001 : eps;
    return this.length() < eps;
  },

  toString: function toString() {
    return this._x + ',' + this._y;
  },

  toObject: function toObject() {
    return { x: this._x, y: this._y };
  }

};

var xgs = {
  enumerable: true,
  get: function get() {
    return this._x;
  },
  set: function set(v) {
    this._x = v;
    this.trigger(_constantEventTypes2['default'].change, 'x');
  }
};

var ygs = {
  enumerable: true,
  get: function get() {
    return this._y;
  },
  set: function set(v) {
    this._y = v;
    this.trigger(_constantEventTypes2['default'].change, 'y');
  }
};

/**
 * Override Backbone bind / on in order to add properly broadcasting.
 * This allows Vector to not broadcast events unless event listeners
 * are explicity bound to it.
 */

Vector.prototype.bind = Vector.prototype.on = function () {

  if (!this._bound) {
    this._x = this.x;
    this._y = this.y;
    Object.defineProperty(this, 'x', xgs);
    Object.defineProperty(this, 'y', ygs);
    _utilUnderscore2['default'].extend(this, BoundProto);
    this._bound = true; // Reserved for event initialization check
  }

  _utilEventsDecoratorJs2['default'].bind.apply(this, arguments);

  return this;
};

exports['default'] = Vector;
module.exports = exports['default'];