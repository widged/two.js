/* jshint esnext: true */

import _  from '../util/common';
import Stop      from '../gradient/Stop';
import Shape     from '../Shape';
import Collection  from '../struct/Collection';

const PROPS = [ 'spread' ];

class Gradient extends Shape {

  // --------------------
  // Constructor
  // --------------------

  constructor(stops) {
    super();
    this._renderer.type = 'gradient';
    this.spread = 'pad';
    this.stops = stops;
  }

  // --------------------
  // Accessors
  // --------------------

  get stops() {
    return this._stops;
  }


  set stops(stops) {
    // :CHANGE: bindStops removed as Stop never dispaches a change event.
    // Create new Collection with copy of Stops
    this._stops = new Collection((stops || []).slice(0));
  }

  // -----------------
  // Main
  // -----------------

  flagReset() {

    this._flagSpread = this._flagStops = false;

    Shape.prototype.flagReset.call(this);

    return this;

  }

  // -----------------
  // Utils
  // -----------------

  clone(parent) {
    parent = parent || this.parent;
    var stops = _.map(this.stops, function(s) {
      return s.clone();
    });
    var clone = Shape.clone(this, new Gradient(), PROPS.concat('stops'));
    parent.add(clone);
    return clone;
  }

  toObject() {
    var obj = Shape.toObject(this, {}, PROPS);
    obj.stops = _.map(this.stops, function(s) {
        return s.toObject();
    });
    return obj;
  }


}

Gradient.Stop = Stop;
Gradient.Properties = PROPS;

Object.defineProperty(Gradient.prototype, 'stops', {enumerable: true});

_.defineFlaggedAccessors(Gradient.prototype, PROPS);


export default Gradient;
