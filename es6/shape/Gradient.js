import _  from '../util/common';
import EventTypes    from '../constant/EventTypes';
import Stop      from '../gradient/Stop';
import Shape     from './Shape';
import Collection  from '../struct/Collection';

class Gradient extends Shape {

  constructor(stops) {
    super();
    this._renderer.type = 'gradient';
    this.spread = 'pad';
    this.stops = stops;
  }

  clone(parent) {

    parent = parent || this.parent;

    var stops = _.map(this.stops, function(s) {
      return s.clone();
    });

    var clone = new Gradient(stops);

    _.each(Gradient.Properties, function(k) {
      clone[k] = this[k];
    }, this);

    clone.translation.copy(this.translation);
    clone.rotation = this.rotation;
    clone.scale = this.scale;

    parent.add(clone);

    return clone;

  }

  toObject() {

    var result = {
      stops: _.map(this.stops, function(s) {
        return s.toObject();
      })
    };

    _.each(Gradient.Properties, function(k) {
      result[k] = this[k];
    }, this);

    return result;

  }

  flagReset() {

    this._flagSpread = this._flagStops = false;

    Shape.prototype.flagReset.call(this);

    return this;

  }

}


Gradient.Stop = Stop;

Gradient.Properties = [ 'spread' ];

Gradient.MakeObservable = function(object) {

  _.each(Gradient.Properties, _.defineProperty, object);

  Object.defineProperty(object, 'stops', {

    enumerable: true,

    get() {
      return this._stops;
    },

    set(stops) {

      var updateStops = _.bind(Gradient.FlagStops, this);

      // Remove previous listeners
      if (this._stops) {
        this._stops.off();
      }

      // Create new Collection with copy of Stops
      this._stops = new Collection((stops || []).slice(0));

      // :CHANGE: bindStops removed as Stop never dispaches a change event. 


    }

  });

};

Gradient.FlagStops = function() {
  this._flagStops = true;
}

_.extend(Gradient.prototype, Shape.prototype);
  

  Gradient.MakeObservable(Gradient.prototype);

export default Gradient;