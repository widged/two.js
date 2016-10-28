'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilUtils = require('../util/utils');

var _utilUtils2 = _interopRequireDefault(_utilUtils);

var _constantEventTypes = require('../constant/EventTypes');

var _constantEventTypes2 = _interopRequireDefault(_constantEventTypes);

var _Stop = require('./Stop');

var _Stop2 = _interopRequireDefault(_Stop);

var _Shape = require('./Shape');

var _Shape2 = _interopRequireDefault(_Shape);

var _utilCollection = require('../util/Collection');

var _utilCollection2 = _interopRequireDefault(_utilCollection);

var Gradient = function Gradient(stops) {

  _Shape2['default'].call(this);

  this._renderer.type = 'gradient';

  this.spread = 'pad';

  this.stops = stops;
};

_utilUtils2['default'].extend(Gradient, {

  Stop: _Stop2['default'],

  Properties: ['spread'],

  MakeObservable: function MakeObservable(object) {

    _Shape2['default'].MakeObservable(object);

    _utilUtils2['default'].each(Gradient.Properties, _utilUtils2['default'].defineProperty, object);

    Object.defineProperty(object, 'stops', {

      enumerable: true,

      get: function get() {
        return this._stops;
      },

      set: function set(stops) {

        var updateStops = _utilUtils2['default'].bind(Gradient.FlagStops, this);

        var bindStops = _utilUtils2['default'].bind(function (items) {

          // This function is called a lot
          // when importing a large SVG
          var i = items.length;
          while (i--) {
            items[i].bind(_constantEventTypes2['default'].change, updateStops);
          }

          updateStops();
        }, this);

        var unbindStops = _utilUtils2['default'].bind(function (items) {

          _utilUtils2['default'].each(items, function (v) {
            v.unbind(_constantEventTypes2['default'].change, updateStops);
          }, this);

          updateStops();
        }, this);

        // Remove previous listeners
        if (this._stops) {
          this._stops.unbind();
        }

        // Create new Collection with copy of Stops
        this._stops = new _utilCollection2['default']((stops || []).slice(0));

        // Listen for Collection changes and bind / unbind
        this._stops.bind(_constantEventTypes2['default'].insert, bindStops);
        this._stops.bind(_constantEventTypes2['default'].remove, unbindStops);

        // Bind Initial Stops
        bindStops(this._stops);
      }

    });
  },

  FlagStops: function FlagStops() {
    this._flagStops = true;
  }

});

_utilUtils2['default'].extend(Gradient.prototype, _Shape2['default'].prototype, {

  clone: function clone(parent) {

    parent = parent || this.parent;

    var stops = _utilUtils2['default'].map(this.stops, function (s) {
      return s.clone();
    });

    var clone = new Gradient(stops);

    _utilUtils2['default'].each(Gradient.Properties, function (k) {
      clone[k] = this[k];
    }, this);

    clone.translation.copy(this.translation);
    clone.rotation = this.rotation;
    clone.scale = this.scale;

    parent.add(clone);

    return clone;
  },

  toObject: function toObject() {

    var result = {
      stops: _utilUtils2['default'].map(this.stops, function (s) {
        return s.toObject();
      })
    };

    _utilUtils2['default'].each(Gradient.Properties, function (k) {
      result[k] = this[k];
    }, this);

    return result;
  },

  flagReset: function flagReset() {

    this._flagSpread = this._flagStops = false;

    _Shape2['default'].prototype.flagReset.call(this);

    return this;
  }

});

Gradient.MakeObservable(Gradient.prototype);

exports['default'] = Gradient;
module.exports = exports['default'];