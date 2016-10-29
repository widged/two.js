import _  from '../util/common';
import EventTypes   from '../constant/EventTypes';
import Identifier from '../constant/Identifier';
import Matrix from '../struct/Matrix';
import Vector from '../struct/Vector';
import UidGenerator from '../util/uid-generator';

var uniqueId = UidGenerator();

// Flags
const FLAGS = {
  _flagMatrix: true,
  // _flagMask: false,
  // _flagClip: false,
}

const PROPS = {
  // Underlying Properties
  _rotation: 0,
  _scale: 1,
  // _mask: null,
  // _clip: false,
}

class Shape {

  constructor() {

    Object.keys(FLAGS).forEach((k) => { this[k] = FLAGS[k] });
    Object.keys(PROPS).forEach((k) => { this[k] = PROPS[k] });

    // Private object for renderer specific variables.
    this._renderer = {};

    this.id = Identifier + uniqueId();
    this.classList = [];

    // Define matrix properties which all inherited
    // objects of Shape have.

    this._matrix = new Matrix();

    var flagMatrix = () => { this._flagMatrix = true; }
    this.translation = new Vector();
    this.translation.on(EventTypes.change, flagMatrix);
    this.rotation = 0;
    this.scale = 1;

  }

  get rotation() {
    return this._rotation;
  }
  set rotation(v) {
    this._rotation = v;
    this._flagMatrix = true;
  }
  get scale() {
    return this._scale;
  }
  set scale(v) {
    this._scale = v;
    this._flagMatrix = true;
    this._flagScale = true;
  }  

  addTo(group) {
    group.add(this);
    return this;
  }

  clone() {
    var clone = new Shape();
    clone.translation.copy(this.translation);
    clone.rotation = this.rotation;
    clone.scale = this.scale;
    copyKeys(PROPS, this, clone);
    return clone._update();
  }  

  /**
   * To be called before render that calculates and collates all information
   * to be as up-to-date as possible for the render. Called once a frame.
   */
  _update(deep) {

    if (!this._matrix.manual && this._flagMatrix) {
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

  flagReset() {
    this._flagMatrix = this._flagScale = false;
    return this;
  }  
}
Shape.Properties = PROPS;

Object.defineProperty(Shape.prototype, 'rotation', {enumerable: true});
Object.defineProperty(Shape.prototype, 'scale', {enumerable: true});

export default Shape;

