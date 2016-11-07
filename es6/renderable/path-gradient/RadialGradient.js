/* jshint esnext: true */

import IMPORTS from '../_imports';
import Gradient  from './Gradient';

const {VectorEvented, VectorEventTypes} = IMPORTS;
const {RenderableDefaults} = IMPORTS;
const {is, exportFN} = IMPORTS;

const {cloned, serialized} = exportFN;
const {isNumber, isUndefined} = is;

const PROP_DEFAULTS = RenderableDefaults.RadialGradient;
const PROP_KEYS = Object.keys(PROP_DEFAULTS);

/**
 * A `RadialGradient` defines a radial color transition with a given radius,
 * center point and focal point
 */
class RadialGradient extends Gradient {

  /**
   * A radial gradient takes a set of x, y coordinates to define the center of
   * the styling. These coordinates are relative to the origin of a `Path`. This
   * typically means you'll want to set these to 0, 0. Next define how large the
   * radius for the radial gradient is. Lastly, pass an array of Stops to define
   * the coloring of the radial gradient. Optionally, you can pass a set of x, y
   * coordinates to define the focal position of the radial gradient's trajectory.
   */
  constructor(cx, cy, r, stops, fx, fy) {
    super(stops);
    var props = PROP_DEFAULTS;
    if(isNumber(cx) || isNumber(cy)) { props.center = {x: cx || 0, y: cy || 0}; }
    if(isNumber(fx) || isNumber(fy)) { props.focal  = {x: fx || 0, y: fy || 0}; }
    if(isNumber(r)) { props.radius = r; }
    this.setProps(props);
  }

  // -----------------
  // IStated
  // -----------------

  beforePropertySet(k, v) {
    v = super.beforePropertySet(k, v);
    if(k === 'radius' && !isUndefined(v)) {
      if(!isNumber(v)) { v = 0; }
    }
    return v;
  }
  afterPropertyChange(k,v,oldV) {
    super.afterPropertyChange(k,v,oldV);
    if(['center','focal','radius']) { this.getState().changeTracker.raise(['endPoints']); }
  }

  // -----------------
  // IRenderable
  // -----------------

  get shapeType() { return 'radial-gradient'; }

  flagReset() {
    super.flagReset();
    this.state.changeTracker.drop(['radius','center','focal']);
    return this;
  }

  // -----------------
  // IExportable
  // -----------------

  /**
   * A function to clone a radialGradient. Also, clones each `Stop` in the radialGradient.stops array.
   */
   // :NOTE: Not used internally, only called by the user
  clone() {
    var shp = this;
    var {stops, center, radius, focal} = shp;
    var clonedStops = (stops || []).map((d) => { return Object.assign({},d); });
    var clone = new RadialGradient(
      center.x, center.y,
      radius,
      clonedStops,
      focal.x, focal.y
    );
    for (let i = 0, ni = PROP_KEYS.length, k = null; i < ni; i++) {
      k = PROP_KEYS[i];
      clone[k] = shp[k];
    }
    return clone;
  }

  // :NOTE: Not used internally, only called by the user
  toObject() {
    var shp = this;
    var obj = Gradient.prototype.toObject.call(shp);
    PROP_KEYS.forEach((k) => { obj[k] = serialized(shp[k]); });
    return obj;
  }

}

export default RadialGradient;
