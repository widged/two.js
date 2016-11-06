/* jshint esnext: true */

import IMPORTS from '../_imports';
var {Collection}  = IMPORTS;

import Renderable  from '../Renderable';

const {cloned, serializeProperties} = IMPORTS.exportFN;
const {isString, isNumber} = IMPORTS.is;
const {Gradient: PROP_DEFAULTS}  = IMPORTS.RenderableDefaults;

const PROP_KEYS = Object.keys(PROP_DEFAULTS);

/**
 * A `Gradient` defines a color transition. A `Gradient` is not really a shape.
 * It is a styling effect that can be applied to a `Path`. You can style `Path.fill`
 * or `Path.stroke` with a `Gradient` to render a gradient for that part of the `Path`.
 * Check the examples page for exact usage.
 */
class Gradient extends Renderable {

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

  // -----------------
  // IShape
  // -----------------


  beforePropertySet(k, v) {
    v = super.beforePropertySet(k, v);
    if(k === 'stops') {
      v = v.map((stop, i) => {
        var {offset, opacity, color} = stop || {};
        var isOdd = (i % 2 === 0) ? true : false;
        // offset -- A 0 to 1 offset value which defines where on the trajectory of the gradient the full color is rendered.
        offset = isNumber(offset) ? offset : isOdd ? 0 : 1;
        // opacity -- A 0 to 1 value which defines the opacity of the stop. This only renders in `svg` mode.
        opacity = isNumber(opacity) ? opacity : 1;
        // color -- A css string that represents the color of the stop.
        color   = isString(color) ? color : isOdd ? '#fff' : '#000';
        return {offset, opacity, color};
      });
      v = new Collection((v || []).slice(0));
    }
    return v;
  }

  // -----------------
  // IRenderable
  // -----------------

  get shapeType() { return 'gradient'; }

  flagReset() {
    super.flagReset();
    this.getState().changeTracker.drop(['spread', 'stops']);
    return this;
  }

  // -----------------
  // IExportable
  // -----------------

  // :NOTE: Not used internally, only called by the user
  clone() {
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

  // :NOTE: Not used internally, only called by the user
  toObject() {
    var shp = this;
    var obj = serializeProperties(shp, {}, Object.keys(PROP_DEFAULTS));
    obj.stops = shp.stops.map(function(s) { return s.toObject(); });
    return obj;
  }


}



export default Gradient;
