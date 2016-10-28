import _  from '../utils/utils';
import EventTypes    from '../constants/EventTypes';
import Vector    from '../Vector';
import Gradient  from './Gradient';


var LinearGradient = function(x1, y1, x2, y2, stops) {

  Gradient.call(this, stops);

  this._renderer.type = 'linear-gradient';

  var flagEndPoints = _.bind(LinearGradient.FlagEndPoints, this);
  this.left = new Vector().bind(EventTypes.change, flagEndPoints);
  this.right = new Vector().bind(EventTypes.change, flagEndPoints);

  if (_.isNumber(x1)) {
    this.left.x = x1;
  }
  if (_.isNumber(y1)) {
    this.left.y = y1;
  }
  if (_.isNumber(x2)) {
    this.right.x = x2;
  }
  if (_.isNumber(y2)) {
    this.right.y = y2;
  }

};

_.extend(LinearGradient, {

  Stop: Gradient.Stop,

  MakeObservable: function(object) {
    Gradient.MakeObservable(object);
  },

  FlagEndPoints: function() {
    this._flagEndPoints = true;
  }

});

_.extend(LinearGradient.prototype, Gradient.prototype, {

  _flagEndPoints: false,

  clone: function(parent) {

    parent = parent || this.parent;

    var stops = _.map(this.stops, function(stop) {
      return stop.clone();
    });

    var clone = new LinearGradient(this.left._x, this.left._y,
      this.right._x, this.right._y, stops);

    _.each(Gradient.Properties, function(k) {
      clone[k] = this[k];
    }, this);

    parent.add(clone);

    return clone;

  },

  toObject: function() {

    var result = Gradient.prototype.toObject.call(this);

    result.left = this.left.toObject();
    result.right = this.right.toObject();

    return result;

  },

  flagReset: function() {

    this._flagEndPoints = false;

    Gradient.prototype.flagReset.call(this);

    return this;

  }

});

LinearGradient.MakeObservable(LinearGradient.prototype);

export default LinearGradient;