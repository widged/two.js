import _  from '../util/underscore';
import is  from '../util/is';
import EventsDecorator   from '../util/eventsDecorator.js';

class Stop {

  constructor(offset, color, opacity) {

    this._renderer = {};

    this.offset = is.Number(offset) ? offset
      : Stop.Index <= 0 ? 0 : 1;

    this.opacity = is.Number(opacity) ? opacity : 1;

    this.color = is.String(color) ? color
      : Stop.Index <= 0 ? '#fff' : '#000';

    Stop.Index = (Stop.Index + 1) % 2;

  }
}

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