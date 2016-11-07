/* jshint esnext: true */

import IMPORTS from '../_imports';
import Gradient  from './Gradient';

const {VectorEvented, VectorEventTypes} = IMPORTS;
const {RenderableDefaults} = IMPORTS;
const {is, exportFN} = IMPORTS;

const {isNumber, isUndefined} = is;
const {cloned} = exportFN;

const PROP_DEFAULTS = RenderableDefaults.LinearGradient;
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
    var props = PROP_DEFAULTS;
    if(isNumber(x1) || isNumber(y1)) { props.left  =  {x:x1 || 0,y:y1 || 0}; }
    if(isNumber(x2) || isNumber(y2)) { props.right =  {x:x2 || 0,y:y2 || 0}; }
    this.setProps(props);
  }

  // -----------------
  // IStated
  // -----------------

  beforePropertySet(key, newV) {
    newV = super.beforePropertySet(key, newV);
    if(key === 'left' || key === 'right') {
      let {x,y} = newV || {};
      var oldV = this.getState()[key];
      if(oldV && oldV.dispatcher) { oldV.dispatcher.off(); }
      if(isNumber(x) || isNumber(y)) {
        newV = new VectorEvented().set(isNumber(x) ? x : 0, isNumber(y) ? y : 0);
      }
    }
    return newV;
  }

  afterPropertyChange(key, newV, oldV) {
    super.afterPropertyChange();
    if(newV === oldV) { return; }
    if(['left','right'].includes(key)) {
      let changeTracker = this.getState().changeTracker;
      if(newV && newV.dispatcher) {
        newV.dispatcher.on( VectorEventTypes.change, this.bindOnce('flagEndPoints', () => { this.getState().changeTracker.raise(['endPoints']); } ) );
      }
      this.getState().changeTracker.raise(['endPoints']);
    }
  }


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
