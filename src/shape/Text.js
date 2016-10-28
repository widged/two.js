'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilUtils = require('../util/utils');

var _utilUtils2 = _interopRequireDefault(_utilUtils);

var _Shape = require('./Shape');

var _Shape2 = _interopRequireDefault(_Shape);

var getComputedMatrix = _utilUtils2['default'].getComputedMatrix;

Text = function (message, x, y, styles) {

  _Shape2['default'].call(this);

  this._renderer.type = 'text';

  this.value = message;

  if (_utilUtils2['default'].isNumber(x)) {
    this.translation.x = x;
  }
  if (_utilUtils2['default'].isNumber(y)) {
    this.translation.y = y;
  }

  if (!_utilUtils2['default'].isObject(styles)) {
    return this;
  }

  _utilUtils2['default'].each(Text.Properties, function (property) {

    if (property in styles) {
      this[property] = styles[property];
    }
  }, this);
};

_utilUtils2['default'].extend(Text, {

  Properties: ['value', 'family', 'size', 'leading', 'alignment', 'fill', 'stroke', 'linewidth', 'style', 'weight', 'decoration', 'baseline', 'opacity', 'visible'],

  MakeObservable: function MakeObservable(object) {

    _Shape2['default'].MakeObservable(object);

    _utilUtils2['default'].each(Text.Properties, _utilUtils2['default'].defineProperty, object);

    Object.defineProperty(object, 'clip', {
      enumerable: true,
      get: function get() {
        return this._clip;
      },
      set: function set(v) {
        this._clip = v;
        this._flagClip = true;
      }
    });
  }

});

_utilUtils2['default'].extend(Text.prototype, _Shape2['default'].prototype, {

  // Flags
  // http://en.wikipedia.org/wiki/Flag

  _flagValue: true,
  _flagFamily: true,
  _flagSize: true,
  _flagLeading: true,
  _flagAlignment: true,
  _flagBaseline: true,
  _flagStyle: true,
  _flagWeight: true,
  _flagDecoration: true,

  _flagFill: true,
  _flagStroke: true,
  _flagLinewidth: true,
  _flagOpacity: true,
  _flagVisible: true,

  _flagClip: false,

  // Underlying Properties

  _value: '',
  _family: 'sans-serif',
  _size: 13,
  _leading: 17,
  _alignment: 'center',
  _baseline: 'middle',
  _style: 'normal',
  _weight: 500,
  _decoration: 'none',

  _fill: '#000',
  _stroke: 'transparent',
  _linewidth: 1,
  _opacity: 1,
  _visible: true,

  _clip: false,

  remove: function remove() {

    if (!this.parent) {
      return this;
    }

    this.parent.remove(this);

    return this;
  },

  clone: function clone(parent) {

    var parent = parent || this.parent;

    var clone = new Text(this.value);
    clone.translation.copy(this.translation);
    clone.rotation = this.rotation;
    clone.scale = this.scale;

    _utilUtils2['default'].each(Text.Properties, function (property) {
      clone[property] = this[property];
    }, this);

    parent.add(clone);

    return clone;
  },

  toObject: function toObject() {

    var result = {
      translation: this.translation.toObject(),
      rotation: this.rotation,
      scale: this.scale
    };

    _utilUtils2['default'].each(Text.Properties, function (property) {
      result[property] = this[property];
    }, this);

    return result;
  },

  noStroke: function noStroke() {
    this.stroke = 'transparent';
    return this;
  },

  noFill: function noFill() {
    this.fill = 'transparent';
    return this;
  },

  /**
   * A shim to not break `getBoundingClientRect` calls. TODO: Implement a
   * way to calculate proper bounding boxes of `Text`.
   */
  getBoundingClientRect: function getBoundingClientRect(shallow) {

    var matrix, border, l, x, y, i, v;

    var left = Infinity,
        right = -Infinity,
        top = Infinity,
        bottom = -Infinity;

    // TODO: Update this to not __always__ update. Just when it needs to.
    this._update(true);

    matrix = !!shallow ? this._matrix : getComputedMatrix(this);

    v = matrix.multiply(0, 0, 1);

    return {
      top: v.x,
      left: v.y,
      right: v.x,
      bottom: v.y,
      width: 0,
      height: 0
    };
  },

  flagReset: function flagReset() {

    this._flagValue = this._flagFamily = this._flagSize = this._flagLeading = this._flagAlignment = this._flagFill = this._flagStroke = this._flagLinewidth = this._flagOpaicty = this._flagVisible = this._flagClip = this._flagDecoration = this._flagBaseline = false;

    _Shape2['default'].prototype.flagReset.call(this);

    return this;
  }

});

Text.MakeObservable(Text.prototype);

exports['default'] = Text;
module.exports = exports['default'];