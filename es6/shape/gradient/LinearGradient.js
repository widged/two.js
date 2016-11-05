/* jshint esnext: true */

import _  from '../../util/common';
import is  from '../../util/is';
import VectorEventTypes    from '../../constant/VectorEventTypes';
import Vector    from '../../struct/Vector';
import Gradient  from '../Gradient';
import shapeFN    from '../../shape-fn';
import DefaultValues from '../../constant/DefaultValues';

var {isNumber} = is;
var {cloned} = shapeFN;

const PROP_DEFAULTS = DefaultValues.LinearGradient;
const PROP_KEYS = Object.keys(PROP_DEFAULTS);

/**
 * A `LinearGradient` defines a linear color transition between a beginning and
 * an ending endPoint.
 */
class LinearGradient extends Gradient {

  /**
   * new Two.LinearGradient(x1, y1, x2, y2, stops);
   * A linear gradient takes two sets of x, y coordinates to define the endpoints of
   * the styling. These coordinates are relative to the origin of a Two.Path. This
   * typically means you'll want to go from a negative quadrant to a positive quadrant
   * in order for the gradient to render correctly. Lastly it takes an array of `Stops`
   * which represent the color value along the gradient's trajectory.
   */
  constructor(x1, y1, x2, y2, stops) {

    super(stops);
    this.setRendererType('linear-gradient');

    // this.setProps(PROP_DEFAULTS);
    this.setProps({
      left: {x:x1,y:y1},
      right: {x:x2,y:y2},
    });

  }

  beforePropertySet(key, newV) {
    newV = super.beforePropertySet(key, newV);
    if(key === 'left' || key === 'right') {
      let {x,y} = newV;
      var oldV = this.getState()[key];
      if(oldV && oldV.dispatcher) { oldV.dispatcher.off(); }
      newV = new Vector().set(isNumber(x) ? x : undefined, isNumber(y) ? y : undefined);
    }
    return newV;
  }
  afterPropertyChange(key, newV) {
    if(key === 'left' || key === 'right') {
      let changeTracker = this.getState().changeTracker;
      if(newV && newV.dispatcher) {
        newV.dispatcher.on(
          VectorEventTypes.change,
          this.bindOnce('flagEndPoints', () => { changeTracker.raise(['endPoints']); } )
        );
        changeTracker.drop(['endPoints']);
      }
  }
  }


  // -----------------
  // IRenderable
  // -----------------

  flagReset() {
    super.flagReset();
    this.getState().changeTracker.drop(['endPoints']);
    return this;
  }

  /**
   A function to clone a linearGradient. Also, clones each Two.Stop in the linearGradient.stops array.
  */
  clone() {
    console.log('ONLY CALLED BY USER')
    var shp = this;
    var {stops, left, right} = shp;
    stops = (stops || []).map(cloned);
    var clone = new LinearGradient(left.x, left.y, right.x, right.y, stops);
    for (let i = 0, ni = PROP_KEYS.length, k = null; i < ni; i++) {
      k = PROP_KEYS[i];
      clone[k] = shp[k];
    }
    return clone;
  }

  toObject() {
    console.log('ONLY CALLED BY USER')
    var result = super.toObject();
    var shp = this;
    var {left, right} = shp;
    result.left = left.toObject();
    result.right = right.toObject();
    return result;
  }
}

export default LinearGradient;
