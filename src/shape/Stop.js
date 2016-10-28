'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilUtils = require('../util/utils');

var _utilUtils2 = _interopRequireDefault(_utilUtils);

var _utilEventsDecoratorJs = require('../util/eventsDecorator.js');

var _utilEventsDecoratorJs2 = _interopRequireDefault(_utilEventsDecoratorJs);

var Stop = function Stop(offset, color, opacity) {

  this._renderer = {};

  this.offset = _utilUtils2['default'].isNumber(offset) ? offset : Stop.Index <= 0 ? 0 : 1;

  this.opacity = _utilUtils2['default'].isNumber(opacity) ? opacity : 1;

  this.color = _utilUtils2['default'].isString(color) ? color : Stop.Index <= 0 ? '#fff' : '#000';

  Stop.Index = (Stop.Index + 1) % 2;
};

_utilUtils2['default'].extend(Stop, {

  Index: 0,

  Properties: ['offset', 'opacity', 'color'],

  MakeObservable: function MakeObservable(object) {

    _utilUtils2['default'].each(Stop.Properties, _utilUtils2['default'].defineProperty, object);
  }

});

_utilUtils2['default'].extend(Stop.prototype, _utilEventsDecoratorJs2['default'], {

  clone: function clone() {

    var clone = new Stop();

    _utilUtils2['default'].each(Stop.Properties, function (property) {
      clone[property] = this[property];
    }, this);

    return clone;
  },

  toObject: function toObject() {

    var result = {};

    _utilUtils2['default'].each(Stop.Properties, function (k) {
      result[k] = this[k];
    }, this);

    return result;
  },

  flagReset: function flagReset() {

    this._flagOffset = this._flagColor = this._flagOpacity = false;

    return this;
  }

});

exports['default'] = Stop;
module.exports = exports['default'];