/* jshint esnext: true */

import _  from '../util/common';
import Stop      from './gradient/Stop';
import Shape     from '../Shape';
import shapeFN    from '../shape-fn';
import Collection  from '../struct/Collection';

var {cloned, serializeProperties, cloneProperties, defineSecretAccessors} = shapeFN;

class Gradient extends Shape {

  // --------------------
  // Constructor
  // --------------------

  constructor(stops) {
    super();
    this.state.renderer.type = 'gradient';
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
  // IRenderable
  // -----------------

  flagReset() {
    super.flagReset();
    this.state.changeTracker.drop(['spread', 'stops']);
    return this;
  }

  clone(parent) {
    parent = parent || this.parent;
    var clone = cloneProperties(this, new Gradient(), Gradient.Properties);
    clone.stops = this.stops.map(cloned);
    parent.add(clone);
    return clone;
  }

  toObject() {
    var obj = serializeProperties(this, {}, Gradient.Properties);
    obj.stops = this.stops.map(function(s) { return s.toObject(); });
    return obj;
  }


}

Gradient.Stop = Stop;
Gradient.Properties = [ 'spread' ];

defineSecretAccessors({proto: Gradient.prototype, accessors: Gradient.Properties});


export default Gradient;
