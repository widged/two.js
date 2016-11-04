/* jshint esnext: true */

import _  from '../util/common';
import Stop      from './gradient/Stop';
import Shape     from '../Shape';
import shapeFN    from '../shape-fn';
import Collection  from '../struct/Collection';
import DefaultValues from '../constant/DefaultValues';

var {cloned, serializeProperties} = shapeFN;

var DEFAULTS  = DefaultValues.Gradient;

class Gradient extends Shape {

  // --------------------
  // Constructor
  // --------------------

  constructor(stops) {
    super();
    this.state.renderer.type = 'gradient';
    this.state.spread = 'pad';
    this.state.stops = stops;
  }

  // --------------------
  // Accessors
  // --------------------

  get stops() {
    return this.state.stops;
  }

  set stops(stops) {
    // :CHANGE: bindStops removed as Stop never dispaches a change event.
    // Create new Collection with copy of Stops
    this.state.stops = new Collection((stops || []).slice(0));
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
    var shp = this;
    parent = parent || shp.parent;
    var clone = new Gradient();
    Object.keys(DEFAULTS).forEach((k) => {  clone[k] = shp[k]; });
    clone.stops = shp.stops.map(cloned);
    parent.add(clone);
    return clone;
  }

  toObject() {
    var shp = this;
    var obj = serializeProperties(shp, {}, Object.keys(DEFAULTS));
    obj.stops = shp.stops.map(function(s) { return s.toObject(); });
    return obj;
  }


}

Gradient.Stop = Stop;


export default Gradient;
