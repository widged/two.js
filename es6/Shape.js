/* jshint esnext: true */

import _  from './util/common';
import VectorEvent   from './constant/VectorEvent';
import Matrix from './struct/Matrix';
import Vector from './struct/Vector';
import UidGenerator from './util/uid-generator';
import shapeFN    from './shape-fn';
import DefaultValues from './constant/DefaultValues';
import ChangeTracker from './util/ChangeTracker';
import shapeRendering from './shape-rendering';

var uniqueId = UidGenerator();
var {serializeProperties} = shapeFN;
var {updateShape} = shapeRendering;

var DEFAULTS = DefaultValues.Shape;

/**
*
*/
class Shape {

  // --------------------
  // Constructor
  // --------------------

  constructor() {

     // id - The id of the path. In the svg renderer this is the same number as the id attribute given to the corresponding node. i.e: if path.id = 4 then document.querySelector('#two-' + group.id) will return the corresponding svg node.
    this.id = DefaultValues.ShapeIdentifier + uniqueId();
    // parent  - A reference to the `Group` that contains this instance.
    this.parent = undefined;
    var changeTracker = new ChangeTracker(['matrix','scale','clip']); // clip, mask
    // set on svg import only
    this.classList = [];
    // Private object for renderer specific variables.
    this.state = {
      renderer: {},
      changeTracker,
      matrix: new Matrix(),
      rotation: 0,
      scale: 1,
      translation: new Vector()
    };
    // Define matrix properties which all inherited objects of Shape have.
    this.state.translation = this.state.translation;

    var flagMatrix = () => {  changeTracker.raise(['matrix']);   };
    this.state.translation.dispatcher.on(VectorEvent.change, flagMatrix);
  }

  // --------------------
  // IStated
  // --------------------
  getState() {
    return this.state;
  }

  setState(obj) {
    if(typeof obj === 'object') {
      // this.state = Object.assign(this.state || {}, obj);
      // :TODO: remove once all ._ have been replaced.
      var keys = Object.keys(obj);
      keys.forEach((k) => {
          var nv = obj[k];
          nv = this.beforePropertySet(k, nv);
          var ov = this.state[k];
          this.state[k] = nv;
          this.afterPropertyChange(k, nv, ov);
      });
    }
  }
  setProps(obj) {
    this.setState(obj);
    return this;
  }
  listFlags() {
    var {changeTracker} = this.getState();
    return changeTracker.listChanges();
  }
  beforePropertySet(key, newValue, oldValue) {
    return newValue;
  }
  afterPropertyChange(key, newValue, oldValue) {
    if(['rotation','scale'].includes(key) && newValue !== oldValue) {
      var {changeTracker} = this.getState();
      changeTracker.raise(['matrix']);
    }
    if(newValue !== oldValue) {
      // :TODO: add a raiseOne function to changeTracker
      var {changeTracker} = this.getState();
      changeTracker.raise([key]);
    }
    return newValue;
  }

  // --------------------
  // Accessors
  // --------------------
  setTranslation(x,y) {
    this.state.translation.set(x,y);
  }

  get rendererType() {
    return this.state.renderer && this.state.renderer.type;
  }

  // -----------------
  // Main
  // -----------------

  /**
   * Adds the instance to a `Group`.
   */
  addTo(group) {
    group.add(this);
    return this;
  }

  // -----------------
  // Private
  // -----------------

  /**
   * To be called before render that calculates and collates all information
   * to be as up-to-date as possible for the render. Called once a frame.
   */
  _update(deep) {
    var shp = this;
    var {matrix, changeTracker} = this.getState();
    if (matrix && !matrix.manual && changeTracker.oneChange('matrix')) {
      matrix
        .identity()
        .translate(this.state.translation.x, this.state.translation.y)
        .scale(this.state.scale)
        .rotate(this.state.rotation);
    }
    if(!matrix) {
      console.log('[WARN] matrix is undefed', shp.toString());
    }

    if (deep) {
      // Bubble up to parents mainly for `getBoundingClientRect` method.
      updateShape(shp.parent);
    }

    return this;

  }

  // -----------------
  // IRenderable
  // -----------------

  flagReset() {
    var {changeTracker} = this.getState();
    changeTracker.drop(['matrix','scale']);
    return this;
  }


  clone() {
    var shp = this;
    var clone = new Shape();
    Object.keys(DEFAULTS).forEach((k) => {  clone[k] = shp[k]; });
    return updateShape(clone);
  }

  toObject() {
    var shp = this;
    return serializeProperties({}, shp);
  }

}


export default Shape;
