/* jshint esnext: true */

import _  from './util/common';
import VectorEvent   from './constant/VectorEvent';
import Matrix from './struct/Matrix';
import Vector from './struct/Vector';
import UidGenerator from './util/uid-generator';
import shapeFN    from './shape-fn';
import DefaultValues from './constant/DefaultValues';
import Store from './util/Store';
import shapeRendering from './shape-rendering';

var uniqueId = UidGenerator();
var {cloneProperties, serializeProperties} = shapeFN;
var {raiseFlags, dropFlags, anyPropChanged} = shapeRendering;
var shapeDefaults = DefaultValues.Shape;

var store = Store.create(() => {});

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
    // set on svg import only
    this.classList = [];
    // Private object for renderer specific variables.
    this._renderer = {};
    // Define matrix properties which all inherited objects of Shape have.
    this._matrix = new Matrix();
    this.translation = new Vector();
    this.rotation = 0;
    this.scale = 1;

    var flagMatrix = () => {  raiseFlags(this, ['matrix']);   };
    this.translation.dispatcher.on(VectorEvent.change, flagMatrix);

  }

  // --------------------
  // IStated
  // --------------------
  getState() {
    console.log('getstate')
    return this.state;
  }

  setState(obj) {
    if(typeof obj === 'object') {
      this.state = Object.assign(this.state || {}, obj);
      // :TODO: remove once all ._ have been replaced.
      Object.keys(obj).forEach((k) => {
        this['_'+k] = obj[k];
      });
    }
  }

  // --------------------
  // Accessors
  // --------------------

  get rotation() {
    return this._rotation;
  }
  set rotation(v) {
    this._rotation = v;
    raiseFlags(this, ['matrix']);
  }
  get scale() {
    return this._scale;
  }
  set scale(v) {
    this._scale = v;
    raiseFlags(this, ['matrix','scale']);
  }

  get rendererType() {
    return this._renderer && this._renderer.type;
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

    if (!this._matrix.manual && anyPropChanged(this, ['matrix'])) {
      this._matrix
        .identity()
        .translate(this.translation.x, this.translation.y)
        .scale(this.scale)
        .rotate(this.rotation);

    }

    if (deep) {
      // Bubble up to parents mainly for `getBoundingClientRect` method.
      if (this.parent && this.parent._update) {
        this.parent._update();
      }
    }

    return this;

  }

  // -----------------
  // IRenderable
  // -----------------

  flagReset() {
    dropFlags(this, ['matrix','scale']);
    return this;
  }


  clone() {
    var clone = new Shape();
    cloneProperties(clone, this, Shape.Properties);
    return clone._update();
  }

  toObject() {
    return serializeProperties({}, this);
  }

}
Shape.Properties = Object.keys(shapeDefaults);

// Flags
var raisedFlags = 'matrix,scale'.split(',');
// unraisedFlags: mask, clip

Shape.Properties.forEach((k) => { Shape.prototype[k] = shapeDefaults[k]; });

export default Shape;
