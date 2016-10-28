'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilUtils = require('../util/utils');

var _utilUtils2 = _interopRequireDefault(_utilUtils);

var _constantEventTypes = require('../constant/EventTypes');

var _constantEventTypes2 = _interopRequireDefault(_constantEventTypes);

var _utilEventsDecoratorJs = require('../util/eventsDecorator.js');

var _utilEventsDecoratorJs2 = _interopRequireDefault(_utilEventsDecoratorJs);

var _constantIdentifier = require('../constant/Identifier');

var _constantIdentifier2 = _interopRequireDefault(_constantIdentifier);

var _Matrix = require('../Matrix');

var _Matrix2 = _interopRequireDefault(_Matrix);

var _Vector = require('../Vector');

var _Vector2 = _interopRequireDefault(_Vector);

var _utilUniqueIds = require('../util/UniqueIds');

var _utilUniqueIds2 = _interopRequireDefault(_utilUniqueIds);

var uniqueId = (0, _utilUniqueIds2['default'])();

var Shape = function Shape() {

  // Private object for renderer specific variables.
  this._renderer = {};

  this.id = _constantIdentifier2['default'] + uniqueId();
  this.classList = [];

  // Define matrix properties which all inherited
  // objects of Shape have.

  this._matrix = new _Matrix2['default']();

  this.translation = new _Vector2['default']();
  this.translation.bind(_constantEventTypes2['default'].change, _utilUtils2['default'].bind(Shape.FlagMatrix, this));
  this.rotation = 0;
  this.scale = 1;
};

_utilUtils2['default'].extend(Shape, _utilEventsDecoratorJs2['default'], {

  FlagMatrix: function FlagMatrix() {
    this._flagMatrix = true;
  },

  MakeObservable: function MakeObservable(object) {

    Object.defineProperty(object, 'rotation', {
      enumerable: true,
      get: function get() {
        return this._rotation;
      },
      set: function set(v) {
        this._rotation = v;
        this._flagMatrix = true;
      }
    });

    Object.defineProperty(object, 'scale', {
      enumerable: true,
      get: function get() {
        return this._scale;
      },
      set: function set(v) {
        this._scale = v;
        this._flagMatrix = true;
        this._flagScale = true;
      }
    });
  }

});

_utilUtils2['default'].extend(Shape.prototype, {

  // Flags

  _flagMatrix: true,

  // _flagMask: false,
  // _flagClip: false,

  // Underlying Properties

  _rotation: 0,
  _scale: 1,

  // _mask: null,
  // _clip: false,

  addTo: function addTo(group) {
    group.add(this);
    return this;
  },

  clone: function clone() {
    var clone = new Shape();
    clone.translation.copy(this.translation);
    clone.rotation = this.rotation;
    clone.scale = this.scale;
    _utilUtils2['default'].each(Shape.Properties, function (k) {
      clone[k] = this[k];
    }, this);
    return clone._update();
  },

  /**
   * To be called before render that calculates and collates all information
   * to be as up-to-date as possible for the render. Called once a frame.
   */
  _update: function _update(deep) {

    if (!this._matrix.manual && this._flagMatrix) {
      this._matrix.identity().translate(this.translation.x, this.translation.y).scale(this.scale).rotate(this.rotation);
    }

    if (deep) {
      // Bubble up to parents mainly for `getBoundingClientRect` method.
      if (this.parent && this.parent._update) {
        this.parent._update();
      }
    }

    return this;
  },

  flagReset: function flagReset() {

    this._flagMatrix = this._flagScale = false;

    return this;
  }

});

Shape.MakeObservable(Shape.prototype);

exports['default'] = Shape;
module.exports = exports['default'];