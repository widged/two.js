/* jshint esnext: true */

import _  from '../util/common';
import Stop      from './gradient/Stop';
import Shape     from '../Shape';
import shapeFN    from '../shape-fn';
import Collection  from '../struct/Collection';
import DefaultValues from '../constant/DefaultValues';

var {cloned, serializeProperties} = shapeFN;

var DEFAULTS  = DefaultValues.Gradient;

/**
 * A `Gradient` defines a color transition. By itself a `Gradient` doesn't render anything
 * to the screen. However, in conjunction with a `Path` you can style `Path.fill`
 * or `Path`.stroke with a `Gradient` to render a gradient for that part of the `Path`.
 * Check the examples page for exact usage.
 */
class Gradient extends Shape {

  // --------------------
  // Constructor
  // --------------------

  constructor(stops) {
    super();
    var {renderer} = this.getState();
    renderer.type = 'gradient';
    this.setState(DEFAULTS);
    this.setState({
      stops: new Collection((stops || []).slice(0))
    });
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
