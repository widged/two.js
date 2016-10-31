/* jshint esnext: true */

import _  from './util/common';
import VectorEvent   from './constant/VectorEvent';
import Matrix from './struct/Matrix';
import Vector from './struct/Vector';
import UidGenerator from './util/uid-generator';
import shapeFN    from './shape-fn';
import DefaultValues from './constant/DefaultValues';
import Store from './util/Store';

var uniqueId = UidGenerator();
var {cloneProperties, serializeProperties} = shapeFN;

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

    // Private object for renderer specific variables.
    this._renderer = {};
    this.stateManager =

    this.id = DefaultValues.ShapeIdentifier + uniqueId();
    this.classList = [];

    // Define matrix properties which all inherited
    // objects of Shape have.

    this._matrix = new Matrix();

    var flagMatrix = () => { this._flag_matrix = true; };
    this.translation = new Vector();
    this.translation.dispatcher.on(VectorEvent.change, flagMatrix);
    this.rotation = 0;
    this.scale = 1;

  }

  // --------------------
  // Accessors
  // --------------------

  get rotation() {
    return this._rotation;
  }
  set rotation(v) {
    this._rotation = v;
    this._flag_matrix = true;
  }
  get scale() {
    return this._scale;
  }
  set scale(v) {
    this._scale = v;
    this._flag_matrix = true;
    this._flag_scale = true;
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

  flagReset() {
    this._flag_matrix = this._flag_scale = false;
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

    if (!this._matrix.manual && this._flag_matrix) {
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
  // Utils
  // -----------------


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
