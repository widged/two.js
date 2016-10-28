'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilUnderscore = require('./util/underscore');

var _utilUnderscore2 = _interopRequireDefault(_utilUnderscore);

var _constantCommandTypes = require('./constant/CommandTypes');

var _constantCommandTypes2 = _interopRequireDefault(_constantCommandTypes);

var _constantEventTypes = require('./constant/EventTypes');

var _constantEventTypes2 = _interopRequireDefault(_constantEventTypes);

var _Vector = require('./Vector');

var _Vector2 = _interopRequireDefault(_Vector);

/**
 * An object that holds 3 `Vector`s, the anchor point and its
 * corresponding handles: `left` and `right`.
 */
var Anchor = function Anchor(x, y, ux, uy, vx, vy, command) {

  _Vector2['default'].call(this, x, y);

  this._broadcast = _utilUnderscore2['default'].bind(function () {
    this.trigger(_constantEventTypes2['default'].change);
  }, this);

  this._command = command || _constantCommandTypes2['default'].move;
  this._relative = true;

  if (!command) {
    return this;
  }

  Anchor.AppendCurveProperties(this);

  if (_utilUnderscore2['default'].isNumber(ux)) {
    this.controls.left.x = ux;
  }
  if (_utilUnderscore2['default'].isNumber(uy)) {
    this.controls.left.y = uy;
  }
  if (_utilUnderscore2['default'].isNumber(vx)) {
    this.controls.right.x = vx;
  }
  if (_utilUnderscore2['default'].isNumber(vy)) {
    this.controls.right.y = vy;
  }
};

_utilUnderscore2['default'].extend(Anchor, {

  AppendCurveProperties: function AppendCurveProperties(anchor) {
    anchor.controls = {
      left: new _Vector2['default'](0, 0),
      right: new _Vector2['default'](0, 0)
    };
  }

});

var AnchorProto = {

  listen: function listen() {

    if (!_utilUnderscore2['default'].isObject(this.controls)) {
      Anchor.AppendCurveProperties(this);
    }

    this.controls.left.bind(_constantEventTypes2['default'].change, this._broadcast);
    this.controls.right.bind(_constantEventTypes2['default'].change, this._broadcast);

    return this;
  },

  ignore: function ignore() {

    this.controls.left.unbind(_constantEventTypes2['default'].change, this._broadcast);
    this.controls.right.unbind(_constantEventTypes2['default'].change, this._broadcast);

    return this;
  },

  clone: function clone() {

    var controls = this.controls;

    var clone = new Anchor(this.x, this.y, controls && controls.left.x, controls && controls.left.y, controls && controls.right.x, controls && controls.right.y, this.command);
    clone.relative = this._relative;
    return clone;
  },

  toObject: function toObject() {
    var o = {
      x: this.x,
      y: this.y
    };
    if (this._command) {
      o.command = this._command;
    }
    if (this._relative) {
      o.relative = this._relative;
    }
    if (this.controls) {
      o.controls = {
        left: this.controls.left.toObject(),
        right: this.controls.right.toObject()
      };
    }
    return o;
  }

  // TODO: Make `Anchor.toString`

};

Object.defineProperty(Anchor.prototype, 'command', {

  enumerable: true,

  get: function get() {
    return this._command;
  },

  set: function set(c) {
    this._command = c;
    if (this._command === _constantCommandTypes2['default'].curve && !_utilUnderscore2['default'].isObject(this.controls)) {
      Anchor.AppendCurveProperties(this);
    }
    return this.trigger(_constantEventTypes2['default'].change);
  }

});

Object.defineProperty(Anchor.prototype, 'relative', {

  enumerable: true,

  get: function get() {
    return this._relative;
  },

  set: function set(b) {
    if (this._relative == b) {
      return this;
    }
    this._relative = !!b;
    return this.trigger(_constantEventTypes2['default'].change);
  }

});

_utilUnderscore2['default'].extend(Anchor.prototype, _Vector2['default'].prototype, AnchorProto);

// Make it possible to bind and still have the Anchor specific
// inheritance from Vector
Anchor.prototype.bind = Anchor.prototype.on = function () {
  _Vector2['default'].prototype.bind.apply(this, arguments);
  _utilUnderscore2['default'].extend(this, AnchorProto);
};

Anchor.prototype.unbind = Anchor.prototype.off = function () {
  _Vector2['default'].prototype.unbind.apply(this, arguments);
  _utilUnderscore2['default'].extend(this, AnchorProto);
};

exports['default'] = Anchor;
module.exports = exports['default'];