/* jshint esnext: true */

import _  from '../../util/common';
import is  from '../../util/is';
import VectorEvent    from '../../constant/VectorEvent';
import Vector    from '../../struct/Vector';
import Gradient  from '../Gradient';
import shapeFN    from '../../shape-fn';

var {bind, map} = _;
var {isNumber} = is;
var {cloned} = shapeFN;

/*
This is a class for creating a LinearGradient in two.js. By itself a Two.LinearGradient doesn't render anything specifically to the screen. However, in conjunction with a Two.Path you can style Two.Path.fill or Two.Path.stroke with a Two.LinearGradient to render a gradient for that part of the Two.Path. Check the examples page for exact usage.
construction var linearGradient = new Two.LinearGradient(x1, y1, x2, y2, stops);
A linear gradient takes two sets of x, y coordinates to define the endpoints of the styling. These coordinates are relative to the origin of a Two.Path. This typically means you'll want to go from a negative quadrant to a positive quadrant in order for the gradient to render correctly. Lastly it takes an array of Two.Stops which represent the color value along the gradient's trajectory.
left linearGradient.left
A Two.Vector that represents the position of the x, y coordinates to the “left” of the gradient's two end points.
right linearGradient.right
A Two.Vector that represents the position of the x, y coordinates to the “right” of the gradient's two end points.
spread linearGradient.spread
Defines how the gradient is rendered by the renderer. For more details see the w3c svg spec.
stops linearGradient.stops
A Two.Utils.Collection of Two.Stops that is two-way databound. Individual stops may be manipulated.
clone linearGradient.clone();
A function to clone a linearGradient. Also, clones each Two.Stop in the linearGradient.stops array.
*/
class LinearGradient extends Gradient {

  constructor(x1, y1, x2, y2, stops) {

    super(stops);

    this.state.renderer.type = 'linear-gradient';

    var flagEndPoints = (function() {
      this.state.changeTracker.raise(['endPoints']);
    }).bind(this);

    this.left = new Vector();
    this.left.dispatcher.on(VectorEvent.change, flagEndPoints);
    this.right = new Vector();
    this.right.dispatcher.on(VectorEvent.change, flagEndPoints);

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

    this.state.changeTracker.drop(['endPoints']);

  }

  // -----------------
  // IRenderable
  // -----------------

  flagReset() {
    super.flagReset();
    this.state.changeTracker.drop(['endPoints']);
    return this;

  }

  clone(parent) {
    var shp = this;
    parent = parent || shp.parent;

    var {stops, left, right} = shp;
    stops = (stops || []).map(cloned);
    var clone = new LinearGradient(left.x, left.y, right.x, right.y, stops);
    Object.keys(Gradient.Properties).forEach((k) => { clone[k] = shp[k]; });

    // :TODO: move one level up
    parent.add(clone);
    return clone;
  }

  toObject() {
    var shp = this;
    var result = Gradient.prototype.toObject.call(shp);
    var {left, right} = shp;
    result.left = left.toObject();
    result.right = right.toObject();

    return result;

  }


}



export default LinearGradient;