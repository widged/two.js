/* jshint esnext: true */

import IMPORTS from './_imports';

const {VectorEventTypes, Vector2, Vector2Evented}  = IMPORTS;
const {Matrix}  = IMPORTS;
const {ChangeTracker}  = IMPORTS;

const uniqueId = IMPORTS.UidGenerator();
const {serializeProperties} = IMPORTS.exportFN;
const {updateShape} = IMPORTS.rendererBridge;
const {isNumber} = IMPORTS.is;

const {RenderableDefaults} = IMPORTS;

const PROP_DEFAULTS = RenderableDefaults.Renderable;
const PROP_KEYS = Object.keys(PROP_DEFAULTS);
/**
*
*/
class Renderable {

  // --------------------
  // Constructor
  // --------------------

  constructor(translation) {
     // id - The id of the path. In the svg renderer it is the same number as the id attribute given to the corresponding node. i.e: if path.id = 4 then document.querySelector('#two-' + group.id) will return the corresponding svg node.
    this.id = RenderableDefaults.ShapeIdentifier + uniqueId();
    var changeTracker = new ChangeTracker(); // clip, mask
    // set on svg import only
    this.state = {changeTracker};
    this.setState({
      //  id - The id of the group. In the svg renderer it is the same number as the id attribute given to the corresponding node. i.e: if group.id = 5 then document.querySelector('#two-' + group.id) will return the corresponding node.
      id: this.id,
      // parent  - A reference to the `Group` that contains the instance.
      parent: undefined,
      //  mask - A reference to the `Path` that masks the content within the group. Automatically sets the referenced Two.Path.clip to true.
      mask: undefined,
      // Private object for renderer specific variables.
      renderer: {},
      // Define matrix properties which all inherited objects of Renderable have.
      matrix: new Matrix(),
    });

    translation = Vector2.serializePoint(translation);
    var {x,y} =  translation || {x: 0, y: 0};
    translation = new Vector2Evented().set(x,y);
    this.setProps({
      translation,
      rotation: 0,
      scale: 1,
      classList: [],
    });

    changeTracker.raise(['matrix','scale','clip','opacity']);

    var flagMatrix = () => {  changeTracker.raise(['matrix']);   };
    this.getProps().translation.dispatcher.on(VectorEventTypes.change, flagMatrix);
  }

  beforePropertySet(key, newValue, oldValue) {
    return newValue;
  }
  afterPropertyChange(key, newValue, oldValue) {
    if(['rotation','scale'].includes(key) && newValue !== oldValue) {
      const {changeTracker} = this.getState();
      changeTracker.raise(['matrix']);
    }
    if(newValue !== oldValue) {
      // :TODO: add a raiseOne function to changeTracker
      const {changeTracker} = this.getState();
      changeTracker.raise([key]);
    }
    return newValue;
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

  setState(obj, attr) {
    if(typeof obj === 'object') {
      var keys = Object.keys(obj);
      keys.forEach((k) => {
          var nv = obj[k];
          nv = this.beforePropertySet(k, nv);
          var ov = this.state[k];
          if(attr) {
            if(!this.state[attr]) { this.state[attr] = {}; }
            this.state[attr][k] = nv;
          } else {
            this.state[k] = nv;
          }
          this.afterPropertyChange(k, nv, ov);
      });
    }
  }
  setProps(obj) {
    this.setState(obj, 'props');
    return this;
  }
  getProps(obj) {
    return this.getState().props;
  }

  // --------------------
  // ITracked
  // --------------------

  listFlags() {
    const {changeTracker} = this.getState();
    return changeTracker.listChanges();
  }

  // --------------------
  // Accessors
  // --------------------

  setTranslation(x,y) {
    this.state.props.translation.set(x,y);
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

  /**
   * If added to a `Group`, removes itself from it.
   */
  remove() {
    const shp = this;
    // early exit
    if (!shp.parent) { return shp; }
    // main
    shp.parent.remove(shp);
    return shp;
  }


  // -----------------
  // IRenderable
  // -----------------

  get shapeType() { return 'shape'; }

  flagReset() {
    const {changeTracker} = this.getState();
    changeTracker.drop(['matrix','scale']);
    return this;
  }

  // -----------------
  // IExportable
  // -----------------

  // :NOTE: Not used internally, only called by the user
  clone() {
    const shp = this;
    var clone = new Renderable();
    for (let i = 0, ni = PROP_KEYS.length, k = null; i < ni; i++) {
      k = PROP_KEYS[i];
      clone[k] = shp[k];
    }
    return clone;
  }

  // :NOTE: Not used internally, only called by the user
  toObject() {
    const shp = this;
    var {translation, rotation, scale} = shp.getProps();
    var target = {
      translation: translation.toObject(),
      rotation,
      scale
    };
    return target;
  }

}


export default Renderable;
