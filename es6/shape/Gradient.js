import _  from '../util/common';
import EventTypes    from '../constant/EventTypes';
import Stop      from '../gradient/Stop';
import Shape     from './Shape';
import Collection  from '../struct/Collection';

var {copyKeys} = _;

const PROPS = [ 'spread' ];


class Gradient extends Shape {

  constructor(stops) {
    super();
    this._renderer.type = 'gradient';
    this.spread = 'pad';
    this.stops = stops;
  }

  get stops() {
    return this._stops;
  }

  set stops(stops) {
    var updateStops = _.bind(Gradient.FlagStops, this);
    // Remove previous listeners
    if (this._stops) {
      this._stops.off();
    }
    // Create new Collection with copy of Stops
    this._stops = new Collection((stops || []).slice(0));
    // :CHANGE: bindStops removed as Stop never dispaches a change event. 
  }

  clone(parent) {

    parent = parent || this.parent;

    var stops = _.map(this.stops, function(s) {
      return s.clone();
    });

    var clone = new Gradient(stops);
    copyKeys(PROPS, this, clone);
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

    copyKeys(PROPS, this, result);
    return result;

  }

  flagReset() {

    this._flagSpread = this._flagStops = false;

    Shape.prototype.flagReset.call(this);

    return this;

  }

}


Gradient.Stop = Stop;
Gradient.Properties = PROPS;


Object.defineProperty(Gradient.prototype, 'stops', {enumerable: true});


Gradient.FlagStops = function() {
  this._flagStops = true;
}


_.defineFlaggedAccessors(Gradient.prototype, PROPS);




export default Gradient;