/* jshint esnext: true */

import IMPORTS from '../_imports';

import Renderable  from '../Renderable';

const {RenderableDefaults}  = IMPORTS;
const {is, exportFN} = IMPORTS;

const {isString, isNumber, isUndefined} = is;
const {cloned, serializeProperties} = exportFN;

const PROP_DEFAULTS  = RenderableDefaults.Gradient;
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
    var props = PROP_DEFAULTS;
    if(!isUndefined(stops)) { props.stops = stops; }
    this.setProps(props);
  }

  // -----------------
  // IStated
  // -----------------

  beforePropertySet(k, v) {
    v = super.beforePropertySet(k, v);
    if(k === 'stops' && Array.isArray(v)) {
      v = v.map((stop, i) => {
        let {offset, opacity, color} = stop || {};
        const isOdd = (i % 2 === 0) ? true : false;
        // offset -- A 0 to 1 offset value which defines where on the trajectory of the gradient the full color is rendered.
        offset = isNumber(offset) ? offset : isOdd ? 0 : 1;
        // opacity -- A 0 to 1 value which defines the opacity of the stop. This only renders in `svg` mode.
        opacity = isNumber(opacity) ? opacity : 1;
        // color -- A css string that represents the color of the stop.
        color   = isString(color) ? color : isOdd ? '#fff' : '#000';
        return {offset, opacity, color};
      });
    }
    return v;
  }
  afterPropertyChange(k, v, oldV) {
    super.afterPropertyChange(k, v, oldV);
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
    const shp = this;
    var clone = new Gradient();
    for (let i = 0, ni = PROP_KEYS.length, k = null; i < ni; i++) {
      k = PROP_KEYS[i];
      clone[k] = shp[k];
    }
    const {stops} = this.getProps();
    clone.stops = stops.map(cloned);
    return clone;
  }

  // :NOTE: Not used internally, only called by the user
  toObject() {
    const shp = this;
    var obj = serializeProperties(shp, {}, Object.keys(PROP_DEFAULTS));
    obj.stops = shp.stops.map(function(s) { return s.toObject(); });
    return obj;
  }


}



export default Gradient;
