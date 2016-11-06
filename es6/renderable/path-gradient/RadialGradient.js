/* jshint esnext: true */

import _  from '../../TwoUtil';
import is  from '../../lib/is/is';
import VectorEventTypes    from '../../lib/struct-vector/VectorEventTypes';
import Vector    from '../../lib/struct-vector/Vector';
import exportFN    from '../fn-export';
import RenderableDefaults from '../RenderableDefaults';
import Gradient  from './Gradient';

var {cloned, serialized} = exportFN;
var {isNumber} = is;

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

    var {changeTracker} = this.getState();

    var center = new Vector();
    center.x = isNumber(cx) ? cx : undefined;
    center.y = isNumber(cy) ? cy : undefined;
    var focal = new Vector();
    focal.x = isNumber(fx) ? fx : center.x;
    focal.y = isNumber(fy) ? fy : center.y;

    this.setProps(PROP_DEFAULTS);
    this.setProps({
      center,
      radius : isNumber(r) ? r : 20,
      focal
    });

    changeTracker.drop(['endPoints']);

    center.dispatcher.on(VectorEventTypes.change, () => {
      changeTracker.raise(['center']);
    });

    focal.dispatcher.on(VectorEventTypes.change, () => {
      changeTracker.raise(['focal']);
    });
  }

  // -----------------
  // IShape
  // -----------------

  beforePropertySet(key, newV) {
    newV = super.beforePropertySet(key, newV);
    return newV;
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
    var clonedStops = stops.map((d) => { return Object.assign({},d); });
    var clone = new RadialGradient(
      center.x,
      center.y,
      radius,
      clonedStops,
      focal.x,
      focal.y
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
