'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilUtils = require('../util/utils');

var _utilUtils2 = _interopRequireDefault(_utilUtils);

var _constantEventTypes = require('../constant/EventTypes');

var _constantEventTypes2 = _interopRequireDefault(_constantEventTypes);

var _Vector = require('../Vector');

var _Vector2 = _interopRequireDefault(_Vector);

var _Gradient = require('./Gradient');

var _Gradient2 = _interopRequireDefault(_Gradient);

var RadialGradient = function RadialGradient(cx, cy, r, stops, fx, fy) {

  _Gradient2['default'].call(this, stops);

  this._renderer.type = 'radial-gradient';

  this.center = new _Vector2['default']().bind(_constantEventTypes2['default'].change, _utilUtils2['default'].bind(function () {
    this._flagCenter = true;
  }, this));

  this.radius = _utilUtils2['default'].isNumber(r) ? r : 20;

  this.focal = new _Vector2['default']().bind(_constantEventTypes2['default'].change, _utilUtils2['default'].bind(function () {
    this._flagFocal = true;
  }, this));

  if (_utilUtils2['default'].isNumber(cx)) {
    this.center.x = cx;
  }
  if (_utilUtils2['default'].isNumber(cy)) {
    this.center.y = cy;
  }

  this.focal.copy(this.center);

  if (_utilUtils2['default'].isNumber(fx)) {
    this.focal.x = fx;
  }
  if (_utilUtils2['default'].isNumber(fy)) {
    this.focal.y = fy;
  }
};

_utilUtils2['default'].extend(RadialGradient, {

  Stop: _Gradient2['default'].Stop,

  Properties: ['radius'],

  MakeObservable: function MakeObservable(object) {

    _Gradient2['default'].MakeObservable(object);

    _utilUtils2['default'].each(RadialGradient.Properties, _utilUtils2['default'].defineProperty, object);
  }

});

_utilUtils2['default'].extend(RadialGradient.prototype, _Gradient2['default'].prototype, {

  _flagEndPoints: false,

  clone: function clone(parent) {

    parent = parent || this.parent;

    var stops = _utilUtils2['default'].map(this.stops, function (stop) {
      return stop.clone();
    });

    var clone = new RadialGradient(this.center._x, this.center._y, this._radius, stops, this.focal._x, this.focal._y);

    _utilUtils2['default'].each(_Gradient2['default'].Properties.concat(RadialGradient.Properties), function (k) {
      clone[k] = this[k];
    }, this);

    parent.add(clone);

    return clone;
  },

  toObject: function toObject() {

    var result = _Gradient2['default'].prototype.toObject.call(this);

    _utilUtils2['default'].each(RadialGradient.Properties, function (k) {
      result[k] = this[k];
    }, this);

    result.center = this.center.toObject();
    result.focal = this.focal.toObject();

    return result;
  },

  flagReset: function flagReset() {

    this._flagRadius = this._flagCenter = this._flagFocal = false;

    _Gradient2['default'].prototype.flagReset.call(this);

    return this;
  }

});

RadialGradient.MakeObservable(RadialGradient.prototype);

exports['default'] = RadialGradient;
module.exports = exports['default'];