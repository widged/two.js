import _  from '../utils/utils';
import EventsDecorator   from '../utils/eventsDecorator.js';

var Stop = function(offset, color, opacity) {

  this._renderer = {};

  this.offset = _.isNumber(offset) ? offset
    : Stop.Index <= 0 ? 0 : 1;

  this.opacity = _.isNumber(opacity) ? opacity : 1;

  this.color = _.isString(color) ? color
    : Stop.Index <= 0 ? '#fff' : '#000';

  Stop.Index = (Stop.Index + 1) % 2;

};

_.extend(Stop, {

  Index: 0,

  Properties: [
    'offset',
    'opacity',
    'color'
  ],

  MakeObservable: function(object) {

    _.each(Stop.Properties, _.defineProperty, object);

  }

});

_.extend(Stop.prototype, EventsDecorator, {

  clone: function() {

    var clone = new Stop();

    _.each(Stop.Properties, function(property) {
      clone[property] = this[property];
    }, this);

    return clone;

  },

  toObject: function() {

    var result = {};

    _.each(Stop.Properties, function(k) {
      result[k] = this[k];
    }, this);

    return result;

  },

  flagReset: function() {

    this._flagOffset = this._flagColor = this._flagOpacity = false;

    return this;

  }

});

export default Stop;