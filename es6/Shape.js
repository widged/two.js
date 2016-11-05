/* jshint esnext: true */

import _  from './util/common';
import VectorEventTypes   from './constant/VectorEventTypes';
import Matrix from './struct/Matrix';
import Vector from './struct/Vector';
import UidGenerator from './util/uid-generator';
import shapeFN    from './shape-fn';
import DefaultValues from './constant/DefaultValues';
import ChangeTracker from './util/ChangeTracker';
import shapeRendering from './renderer-lib/renderer-bridge';

var uniqueId = UidGenerator();
var {serializeProperties} = shapeFN;
var {updateShape} = shapeRendering;

const PROP_DEFAULTS = DefaultValues.Shape;
const PROP_KEYS = Object.keys(PROP_DEFAULTS);
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
    var changeTracker = new ChangeTracker(); // clip, mask
    // set on svg import only
    // Private object for renderer specific variables.
    this.state = {changeTracker};
    this.setState({
      //  id - The id of the group. In the svg renderer this is the same number as the id attribute given to the corresponding node. i.e: if group.id = 5 then document.querySelector('#two-' + group.id) will return the corresponding node.
      id: this.id,
      //  parent - A reference to the `Group` that contains this instance.
      parent: undefined,
      //  mask - A reference to the `Path` that masks the content within the group. Automatically sets the referenced Two.Path.clip to true.
      renderer: {},
      // Define matrix properties which all inherited objects of Shape have.
      matrix: new Matrix(),
    });
    this.setProps({
      translation: new Vector(),
      rotation: 0,
      scale: 1,
      classList: [],
    });

    changeTracker.raise(['matrix','scale','clip']);

    var flagMatrix = () => {  changeTracker.raise(['matrix']);   };
    this.getProps().translation.dispatcher.on(VectorEventTypes.change, flagMatrix);
  }



  // --------------------
  // IStated
  // --------------------
  bindOnce(key, fn) {
    if(!this.bound) { this.bound = {}; }
    if(!this.bound[key]) { this.bound[key] = fn.bind(this); }
    return this.bound[key];
  }
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
  getProps(obj) {
    return this.getState();
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

  setRendererType(_) {
    var renderer = this.getState().renderer;
    renderer.type = _;
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
  // IRenderable
  // -----------------

  flagReset() {
    var {changeTracker} = this.getState();
    changeTracker.drop(['matrix','scale']);
    return this;
  }

  clone() {
    console.log('ONLY CALLED BY USER')
    var shp = this;
    var clone = new Shape();
    for (let i = 0, ni = PROP_KEYS.length, k = null; i < ni; i++) {
      k = PROP_KEYS[i];
      clone[k] = shp[k];
    }
    return clone;
  }

  toObject() {
    var shp = this;
    var {translation, rotation, scale} = shp.getState();
    var target = {
      translation: translation.toObject(),
      rotation,
      scale
    };
    return target;
  }

}


export default Shape;
