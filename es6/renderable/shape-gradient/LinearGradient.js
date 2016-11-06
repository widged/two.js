/* jshint esnext: true */

import _  from '../../lib-common/common';
import is  from '../../lib/is/is';
import VectorEventTypes    from '../../lib/struct-Vector/VectorEventTypes';
import Vector    from '../../lib/struct-vector/Vector';
import exportFN    from '../fn-export';
import DefaultValues from '../DefaultValues';
import Gradient  from './Gradient';

var {isNumber} = is;
var {cloned} = exportFN;

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
    // this.setProps(PROP_DEFAULTS);
    this.setProps({
      left: {x:x1,y:y1},
      right: {x:x2,y:y2},
    });

    this.getState().changeTracker.drop(['endPoints']);

  }


  // -----------------
  // IShape
  // -----------------

  beforePropertySet(key, newV) {
    newV = super.beforePropertySet(key, newV);
    if(key === 'left' || key === 'right') {
      let {x,y} = newV || {};
      var oldV = this.getState()[key];
      if(oldV && oldV.dispatcher) { oldV.dispatcher.off(); }
      if(isNumber(x) || isNumber(y)) {
        newV = new Vector().set(isNumber(x) ? x : 0, isNumber(y) ? y : 0);
      }
    }
    return newV;
  }
  afterPropertyChange(key, newV, oldV) {
    super.afterPropertyChange();
    if(newV === oldV) { return; }
    if(['left','right'].includes(key)) {
      let changeTracker = this.getState().changeTracker;
      var raise = () => { this.getState().changeTracker.raise(['endPoints']); };
      if(newV && newV.dispatcher) {
        newV.dispatcher.on( VectorEventTypes.change, this.bindOnce('flagEndPoints', raise ) );
      }
      raise();
    }
  }
  /*
  afterPropertyChange(key, newV, oldV) {
    super.afterPropertyChange();
    if(newV === oldV) { return; }
    if(['left','right'].includes(key)) {
      if(newV && newV.dispatcher) {
        var raise = () => { this.getState().changeTracker.raise(['endPoints']); };
        newV.dispatcher.on( VectorEventTypes.change, this.bindOnce('flagEndPoints', raise ) );
        this.getState().changeTracker.drop(['endPoints']);
      }
    }
  }
*/

  // -----------------
  // IRenderable
  // -----------------

  get shapeType() { return 'linear-gradient'; }

  flagReset() {
    super.flagReset();
    this.getState().changeTracker.drop(['endPoints']);
    return this;
  }

  // -----------------
  // IExportable
  // -----------------

  /**
   A function to clone a linearGradient. Also, clones each Two.Stop in the linearGradient.stops array.
  */
  // :NOTE: Not used internally, only called by the user
  clone() {
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

  // :NOTE: Not used internally, only called by the user
  toObject() {
    var result = super.toObject();
    var shp = this;
    var {left, right} = shp;
    result.left = left.toObject();
    result.right = right.toObject();
    return result;
  }
}

export default LinearGradient;
