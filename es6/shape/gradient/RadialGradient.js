/* jshint esnext: true */

import _  from '../../util/common';
import is  from '../../util/is';
import VectorEvent    from '../../constant/VectorEvent';
import Vector    from '../../struct/Vector';
import shapeFN    from '../../shape-fn';
import Gradient  from '../Gradient';

var {cloned, serialized, defineSecretAccessors} = shapeFN;
var {isNumber} = is;

/*
center radialGradient.center
A `Vector` that represents the position of the x, y coordinates at the center of the gradient.

radius radialGradient.radius
A number representing the radius of the radialGradient.

focal linearGradient.focal
A `Vector` that represents the position of the x, y coordinates as the focal point for the gradient's trajectory.

spread radialGradient.spread
Defines how the gradient is rendered by the renderer. For more details see the w3c svg spec.

stops radialGradient.stops
A `Collection` of `Stops` that is two-way databound. Individual stops may be manipulated.


*/

/**
 *  This is a class for creating a RadialGradient.
 * By itself a `RadialGradient` doesn't render anything specifically to the
 * screen. However, in conjunction with a Path you can style Path.fill
 * or Path.stroke with a RadialGradient to render a gradient for that
 * part of the Path. Check the examples page for exact usage.
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
    parent = parent || this.parent;
    var stops = (this.stops || []).map(cloned);
    var clone = new RadialGradient(
      this.center._x,  this.center._y,
      this._radius, stops,
      this.focal._x, this.focal._y
    );
    Object.keys(RadialGradient.Properties).forEach((k) => { clone[k] = this[k]; });
    parent.add(clone);
    return clone;

  }

  toObject() {
    var obj = Gradient.prototype.toObject.call(this);
    Object.keys(RadialGradient.Properties).forEach((k) => { obj[k] = serialized(this[k]); });
    return obj;
  }


}

RadialGradient.Stop = Gradient.Stop;
RadialGradient.Properties = [ 'radius' ];
defineSecretAccessors({proto: RadialGradient.prototype, accessors: RadialGradient.Properties});

export default RadialGradient;
