/* jshint esnext: true */

import _  from '../util/common';
import is  from '../util/is';
import VectorEvent    from '../constant/VectorEvent';
import Vector    from '../struct/Vector';
import shapeFN    from '../shape-fn';
import Gradient  from '../shape/Gradient';

var {copyKeys} = _;

var {isNumber} = is;

const PROPS = [ 'radius' ];

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
    var gradient = new RadialGradient(
      this.center._x,  this.center._y,
      this._radius, stops,
      this.focal._x, this.focal._y
    );
    var clone = copyKeys(this, gradient, PROPS);
    var stops = _.map(this.stops, function(stop) {
      return stop.clone();
    });
    parent.add(clone);
    return clone;

  }

  toObject() {
    var result = copyKeys( this, Gradient.prototype.toObject.call(this), PROPS);
    result.center = this.center.toObject();
    result.focal = this.focal.toObject();
    return result;
  }

  flagReset() {
    this._flag_radius = this._flag_center = this._flag_focal = false;
    Gradient.prototype.flagReset.call(this);
    return this;
  }

}

RadialGradient.Stop = Gradient.Stop;

shapeFN.defineSecretAccessors(RadialGradient.prototype, PROPS, {});

export default RadialGradient;
