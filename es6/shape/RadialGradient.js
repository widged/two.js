import _  from '../util/underscore';
import is  from '../util/is';
import EventTypes    from '../constant/EventTypes';
import Vector    from '../struct/Vector';
import Gradient  from './Gradient';

class RadialGradient extends Gradient {

  constructor(cx, cy, r, stops, fx, fy) {

    super(stops);

    this._renderer.type = 'radial-gradient';

    this.center = new Vector()
      .on(EventTypes.change, _.bind(function() {
        this._flagCenter = true;
      }, this));

    this.radius = is.Number(r) ? r : 20;

    this.focal = new Vector()
      .on(EventTypes.change, _.bind(function() {
        this._flagFocal = true;
      }, this));

    if (is.Number(cx)) {
      this.center.x = cx;
    }
    if (is.Number(cy)) {
      this.center.y = cy;
    }

    this.focal.copy(this.center);

    if (is.Number(fx)) {
      this.focal.x = fx;
    }
    if (is.Number(fy)) {
      this.focal.y = fy;
    }

    this._flagEndPoints = false;
  
  }


  clone(parent) {

    parent = parent || this.parent;

    var stops = _.map(this.stops, function(stop) {
      return stop.clone();
    });

    var clone = new RadialGradient(this.center._x, this.center._y,
        this._radius, stops, this.focal._x, this.focal._y);

    _.each(Gradient.Properties.concat(RadialGradient.Properties), function(k) {
      clone[k] = this[k];
    }, this);

    parent.add(clone);

    return clone;

  }

  toObject() {

    var result = Gradient.prototype.toObject.call(this);

    _.each(RadialGradient.Properties, function(k) {
      result[k] = this[k];
    }, this);

    result.center = this.center.toObject();
    result.focal = this.focal.toObject();

    return result;

  }

  flagReset() {

    this._flagRadius = this._flagCenter = this._flagFocal = false;

    Gradient.prototype.flagReset.call(this);

    return this;

  }

} 

RadialGradient.Stop = Gradient.Stop;

RadialGradient.Properties = [ 'radius' ];

RadialGradient.MakeObservable = function(object) {
  Gradient.MakeObservable(object);
  _.each(RadialGradient.Properties, _.defineProperty, object);
}


RadialGradient.MakeObservable(RadialGradient.prototype);

export default RadialGradient;