/* jshint esnext: true */

import _  from '../util/common';
import is  from '../util/is';
import VectorEvent    from '../constant/VectorEvent';
import Vector    from '../struct/Vector';
import shapeFN    from '../shape-fn';
import Gradient  from '../shape/Gradient';

var {cloned, serialized} = shapeFN;

var {isNumber} = is;


/*

Two.RadialGradient
This is a class for creating a RadialGradient in two.js. By itself a Two.RadialGradient doesn't render anything specifically to the screen. However, in conjunction with a Two.Path you can style Two.Path.fill or Two.Path.stroke with a Two.RadialGradient to render a gradient for that part of the Two.Path. Check the examples page for exact usage.
construction var radialGradient = new Two.radialGradient(x, y, radius, stops, fx, fy);
A radial gradient takes a set of x, y coordinates to define the center of the styling. These coordinates are relative to the origin of a Two.Path. This typically means you'll want to set these to 0, 0. Next define how large the radius for the radial gradient is. Lastly, pass an array of Two.Stops to define the coloring of the radial gradient. Optionally, you can pass a set of x, y coordinates to define the focal position of the radial gradient's trajectory.
center radialGradient.center
A Two.Vector that represents the position of the x, y coordinates at the center of the gradient.
radius radialGradient.radius
A number representing the radius of the radialGradient.
focal linearGradient.focal
A Two.Vector that represents the position of the x, y coordinates as the focal point for the gradient's trajectory.
spread radialGradient.spread
Defines how the gradient is rendered by the renderer. For more details see the w3c svg spec.
stops radialGradient.stops
A Two.Utils.Collection of Two.Stops that is two-way databound. Individual stops may be manipulated.
clone radialGradient.clone();
A function to clone a radialGradient. Also, clones each Two.Stop in the radialGradient.stops array.
*/
class RadialGradient extends Gradient {

  constructor(cx, cy, r, stops, fx, fy) {

    super(stops);

    this._renderer.type = 'radial-gradient';

    this.center = new Vector();

    this.center.dispatcher.on(VectorEvent.change, () => {
      this._flag_center = true;
    });

    this.radius = isNumber(r) ? r : 20;

    this.focal = new Vector();
    this.focal.dispatcher.on(VectorEvent.change, () => {
      this._flag_focal = true;
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

    this._flag_endPoints = false;

  }

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

  flagReset() {
    this._flag_radius = this._flag_center = this._flag_focal = false;
    Gradient.prototype.flagReset.call(this);
    return this;
  }

}

RadialGradient.Stop = Gradient.Stop;
RadialGradient.Properties = [ 'radius' ];
shapeFN.defineSecretAccessors({proto: RadialGradient.prototype, accessors: RadialGradient.Properties});

export default RadialGradient;
