/* jshint esnext: true */

import _  from './util/common';
import VectorEvent   from './constant/VectorEvent';
import Matrix from './struct/Matrix';
import Vector from './struct/Vector';
import UidGenerator from './util/uid-generator';
import shapeFN    from './shape-fn';

var uniqueId = UidGenerator();
var {copyKeys} = _;

// Flags
const FLAG_DEFAULTS = {
  _flag_matrix: true,
  // _flag_mask: false,
  // _flag_clip: false,
};

const PROP_DEFAULTS = {
  // Underlying Properties
  _rotation: 0,
  _scale: 1,
  // _translation
  // _mask: null,
  // _clip: false,
};


class Shape {

  // --------------------
  // Constructor
  // --------------------

  constructor() {

    // Private object for renderer specific variables.
    this._renderer = {};

    this.id = Shape.Identifier + uniqueId();
    this.classList = [];

    // Define matrix properties which all inherited
    // objects of Shape have.

    this._matrix = new Matrix();

    var flagMatrix = () => { this._flag_matrix = true; }
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
    shapeFN.clone(clone, this);
    return clone._update();
  }

  toObject() {
    return shapeFN.toObject({}, this);
  }

}
Shape.Identifier = 'sh_';


Object.defineProperty(Shape.prototype, 'rotation', {enumerable: true});
Object.defineProperty(Shape.prototype, 'scale', {enumerable: true});
Object.keys(FLAG_DEFAULTS).forEach((k) => { Shape.prototype[k] = FLAG_DEFAULTS[k]; });
Object.keys(PROP_DEFAULTS).forEach((k) => { Shape.prototype[k] = PROP_DEFAULTS[k]; });

export default Shape;
