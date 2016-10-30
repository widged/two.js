/* jshint esnext: true */

import _  from '../util/common';
import is  from '../util/is';
import Shape from '../Shape';

var {isNumber, isObject} = is;
var {copyKeys} = _;

var getComputedMatrix = _.getComputedMatrix;

// Flags
// http://en.wikipedia.org/wiki/Flag
var FLAG_DEFAULTS = {
  _flagValue: true,
  _flagFamily: true,
  _flagSize: true,
  _flagLeading: true,
  _flagAlignment: true,
  _flagBaseline: true,
  _flagStyle: true,
  _flagWeight: true,
  _flagDecoration: true,

  _flagFill: true,
  _flagStroke: true,
  _flagLinewidth: true,
  _flagOpacity: true,
  _flagVisible: true,

  _flagClip: false,
};

// Underlying Properties
var PROP_DEFAULTS = {
  _value: '',
  _family: 'sans-serif',
  _size: 13,
  _leading: 17,
  _alignment: 'center',
  _baseline: 'middle',
  _style: 'normal',
  _weight: 500,
  _decoration: 'none',

  _fill: '#000',
  _stroke: 'transparent',
  _linewidth: 1,
  _opacity: 1,
  _visible: true,

  _clip: false
};

var PROPS = Object.keys(PROP_DEFAULTS).map((k) => { return k.replace(/^_/,''); });


class Text extends Shape {

  // --------------------
  // Constructor
  // --------------------

  constructor(message, x, y, styles) {

    super();

    this._renderer.type = 'text';


    this.value = message;

    if (isNumber(x)) {
        this.translation.x = x;
    }
    if (isNumber(y)) {
        this.translation.y = y;
    }

    if (!isObject(styles)) {
      return this;
    }

    copyKeys(styles, this, PROPS);

  }

  // --------------------
  // Accessors
  // --------------------
  get clip() {
    return this._clip;
  }
  set clip(v) {
    this._clip = v;
    this._flagClip = true;
  }

  // -----------------
  // Main
  // -----------------

  remove() {

    if (!this.parent) {
      return this;
    }

    this.parent.remove(this);

    return this;

  }



  noStroke() {
    this.stroke = 'transparent';
    return this;
  }

  noFill() {
    this.fill = 'transparent';
    return this;
  }

  /**
   * A shim to not break `getBoundingClientRect` calls. TODO: Implement a
   * way to calculate proper bounding boxes of `Text`.
   */
  getBoundingClientRect(shallow) {

    var matrix, border, l, x, y, i, v;

    var left = Infinity, right = -Infinity,
        top = Infinity, bottom = -Infinity;

    // TODO: Update this to not __always__ update. Just when it needs to.
    this._update(true);

    matrix = !!shallow ? this._matrix : getComputedMatrix(this);

    v = matrix.multiply(0, 0, 1);

    return {
      top: v.x,
      left: v.y,
      right: v.x,
      bottom: v.y,
      width: 0,
      height: 0
    };

  }

  flagReset() {

    this._flagValue = this._flagFamily = this._flagSize =
      this._flagLeading = this._flagAlignment = this._flagFill =
      this._flagStroke = this._flagLinewidth = this._flagOpaicty =
      this._flagVisible = this._flagClip = this._flagDecoration =
      this._flagBaseline = false;

    Shape.prototype.flagReset.call(this);

    return this;

  }

  // -----------------
  // Utils
  // -----------------

  clone(parent) {
    if(!parent) { parent = this.parent; }
    var clone = Shape.clone(this, new Text(this.value), PROPS);
    parent.add(clone);
    return clone;
  }

  toObject() {
    return Shape.toObject(this, {}, PROPS);
  }
}

_.defineFlaggedAccessors(Text.prototype, PROPS);
Object.defineProperty(Text.prototype, 'clip', {enumerable: true});
Object.keys(FLAG_DEFAULTS).forEach((k) => { Text.prototype[k] = FLAG_DEFAULTS[k]; });
Object.keys(PROP_DEFAULTS).forEach((k) => { Text.prototype[k] = PROP_DEFAULTS[k]; });

export default Text;
