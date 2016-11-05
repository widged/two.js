/* jshint esnext: true */

import _  from '../util/common';
import Stop      from './gradient/Stop';
import Shape     from '../Shape';
import shapeFN    from '../shape-fn';
import Collection  from '../struct/Collection';
import DefaultValues from '../constant/DefaultValues';

var {cloned, serializeProperties} = shapeFN;

const PROP_DEFAULTS  = DefaultValues.Gradient;
const PROP_KEYS = Object.keys(PROP_DEFAULTS);

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
    this.setProps(PROP_DEFAULTS);
    this.setProps({
      stops
    });
  }

  beforePropertySet(key, newV) {
    newV = super.beforePropertySet(key, newV);
    if(key === 'stops') {
      newV = new Collection((newV || []).slice(0));
    }
    return newV;
  }


  // -----------------
  // IRenderable
  // -----------------

  flagReset() {
    super.flagReset();
    this.getState().changeTracker.drop(['spread', 'stops']);
    return this;
  }

  clone() {
    console.log('ONLY CALLED BY USER')
    var shp = this;
    var clone = new Gradient();
    for (let i = 0, ni = PROP_KEYS.length, k = null; i < ni; i++) {
      k = PROP_KEYS[i];
      clone[k] = shp[k];
    }
    var {stops} = this.getProps();
    clone.stops = stops.map(cloned);
    return clone;
  }

  toObject() {
    console.log('ONLY CALLED BY USER')
  var shp = this;
    var obj = serializeProperties(shp, {}, Object.keys(PROP_DEFAULTS));
    obj.stops = shp.stops.map(function(s) { return s.toObject(); });
    return obj;
  }


}

Gradient.Stop = Stop;


export default Gradient;
