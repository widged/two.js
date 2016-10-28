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

var LinearGradient = function LinearGradient(x1, y1, x2, y2, stops) {

  _Gradient2['default'].call(this, stops);

  this._renderer.type = 'linear-gradient';

  var flagEndPoints = _utilUtils2['default'].bind(LinearGradient.FlagEndPoints, this);
  this.left = new _Vector2['default']().bind(_constantEventTypes2['default'].change, flagEndPoints);
  this.right = new _Vector2['default']().bind(_constantEventTypes2['default'].change, flagEndPoints);

  if (_utilUtils2['default'].isNumber(x1)) {
    this.left.x = x1;
  }
  if (_utilUtils2['default'].isNumber(y1)) {
    this.left.y = y1;
  }
  if (_utilUtils2['default'].isNumber(x2)) {
    this.right.x = x2;
  }
  if (_utilUtils2['default'].isNumber(y2)) {
    this.right.y = y2;
  }
};

_utilUtils2['default'].extend(LinearGradient, {

  Stop: _Gradient2['default'].Stop,

  MakeObservable: function MakeObservable(object) {
    _Gradient2['default'].MakeObservable(object);
  },

  FlagEndPoints: function FlagEndPoints() {
    this._flagEndPoints = true;
  }

});

_utilUtils2['default'].extend(LinearGradient.prototype, _Gradient2['default'].prototype, {

  _flagEndPoints: false,

  clone: function clone(parent) {

    parent = parent || this.parent;

    var stops = _utilUtils2['default'].map(this.stops, function (stop) {
      return stop.clone();
    });

    var clone = new LinearGradient(this.left._x, this.left._y, this.right._x, this.right._y, stops);

    _utilUtils2['default'].each(_Gradient2['default'].Properties, function (k) {
      clone[k] = this[k];
    }, this);

    parent.add(clone);

    return clone;
  },

  toObject: function toObject() {

    var result = _Gradient2['default'].prototype.toObject.call(this);

    result.left = this.left.toObject();
    result.right = this.right.toObject();

    return result;
  },

  flagReset: function flagReset() {

    this._flagEndPoints = false;

    _Gradient2['default'].prototype.flagReset.call(this);

    return this;
  }

});

LinearGradient.MakeObservable(LinearGradient.prototype);

exports['default'] = LinearGradient;
module.exports = exports['default'];