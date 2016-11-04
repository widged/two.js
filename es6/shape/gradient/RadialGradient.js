/* jshint esnext: true */

import _  from '../../util/common';
import is  from '../../util/is';
import VectorEvent    from '../../constant/VectorEvent';
import Vector    from '../../struct/Vector';
import shapeFN    from '../../shape-fn';
import Gradient  from '../Gradient';
import DefaultValues from '../../constant/DefaultValues';

var {cloned, serialized} = shapeFN;
var {isNumber} = is;

var DEFAULTS = DefaultValues.RadialGradient;


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

    this.state.renderer.type = 'radial-gradient';

    this.center = new Vector();

    this.center.dispatcher.on(VectorEvent.change, () => {
      this.state.changeTracker.raise(['center']);
    });

    this.radius = isNumber(r) ? r : 20;

    this.focal = new Vector();
    this.focal.dispatcher.on(VectorEvent.change, () => {
      this.state.changeTracker.raise(['focal']);
    });

    if (isNumber(cx)) {
      this.center.x = cx;
    }
    if (isNumber(cy)) {
      this.center.y = cy;
    }

    this.focal.copy(this.center);

    if (isNumber(fx)) {
      this.focal.x = fx;
    }
    if (isNumber(fy)) {
      this.focal.y = fy;
    }

    this.state.changeTracker.drop(['endPoints']);

  }

  // -----------------
  // IRenderable
  // -----------------

  flagReset() {
    super.flagReset();
    this.state.changeTracker.drop(['radius','center','focal']);
    return this;
  }

  /**
   * A function to clone a radialGradient. Also, clones each `Stop` in the radialGradient.stops array.
   */
  clone(parent) {
    var shp = this;
    parent = parent || shp.parent;
    var {stops, center, radius, focal} = shp;
    stops = (stops || []).map(cloned);
    var clone = new RadialGradient( center.x,  center.y, radius, stops, focal.x, focal.y );
    Object.keys(DEFAULTS).forEach((k) => { clone[k] = shp[k]; });
    parent.add(clone);
    return clone;

  }

  toObject() {
    var shp = this;
    var obj = Gradient.prototype.toObject.call(shp);
    Object.keys(DEFAULTS).forEach((k) => { obj[k] = serialized(shp[k]); });
    return obj;
  }


}


export default RadialGradient;
