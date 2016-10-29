import _  from '../util/common';
import is  from '../util/is';
import EventTypes    from '../constant/EventTypes';
import Vector    from '../struct/Vector';
import Gradient  from '../shape/Gradient';

var {copyKeys} = _;
var {isNumber} = is;

class LinearGradient extends Gradient {

  constructor(x1, y1, x2, y2, stops) {

    super(stops);

    this._renderer.type = 'linear-gradient';

    var flagEndPoints = _.bind(LinearGradient.FlagEndPoints, this);
    this.left = new Vector().on(EventTypes.change, flagEndPoints);
    this.right = new Vector().on(EventTypes.change, flagEndPoints);

    if (isNumber(x1)) {
      this.left.x = x1;
    }
    if (isNumber(y1)) {
      this.left.y = y1;
    }
    if (isNumber(x2)) {
      this.right.x = x2;
    }
    if (isNumber(y2)) {
      this.right.y = y2;
    }

   this._flagEndPoints = false;

  }


  clone(parent) {

    parent = parent || this.parent;

    var stops = _.map(this.stops, function(stop) {
      return stop.clone();
    });

    var clone = new LinearGradient(this.left._x, this.left._y,
      this.right._x, this.right._y, stops);

    copyKeys(Gradient.Properties, this, clone);

    parent.add(clone);

    return clone;

  }

  toObject() {

    var result = Gradient.prototype.toObject.call(this);

    result.left = this.left.toObject();
    result.right = this.right.toObject();

    return result;

  }

  flagReset() {

    this._flagEndPoints = false;

    Gradient.prototype.flagReset.call(this);

    return this;

  }  
}

LinearGradient.Stop = Gradient.Stop;

LinearGradient.FlagEndPoints = function() {
  this._flagEndPoints = true;
}

export default LinearGradient;