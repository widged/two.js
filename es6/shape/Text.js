/* jshint esnext: true */

import _  from '../util/common';
import is  from '../util/is';
import Shape from '../Shape';
import shapeFN    from '../shape-fn';

var {isNumber, isObject} = is;
var {copyKeys} = _;

var getComputedMatrix = _.getComputedMatrix;

// Flags
// http://en.wikipedia.org/wiki/Flag
var FLAG_DEFAULTS = {
  value: true,
  family: true,
  size: true,
  leading: true,
  alignment: true,
  baseline: true,
  style: true,
  weight: true,
  decoration: true,

  fill: true,
  stroke: true,
  linewidth: true,
  opacity: true,
  visible: true,

  clip: false,
};

// Underlying Properties
var PROP_DEFAULTS = {
  value: '',
  family: 'sans-serif',
  size: 13,
  leading: 17,
  alignment: 'center',
  baseline: 'middle',
  style: 'normal',
  weight: 500,
  decoration: 'none',

  fill: '#000',
  stroke: 'transparent',
  linewidth: 1,
  opacity: 1,
  visible: true,

  clip: false
};

var PROPS = Object.keys(PROP_DEFAULTS);


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


  }

  // --------------------
  // Accessors
  // --------------------
  get clip() {
    return this._clip;
  }
  set clip(v) {
    this._clip = v;
    this._flag_clip = true;
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

    this._flag_value = this._flag_family = this._flag_size =
      this._flag_leading = this._flag_alignment = this._flag_fill =
      this._flag_stroke = this._flag_linewidth = this._flag_opaicty =
      this._flag_visible = this._flag_clip = this._flag_decoration =
      this._flag_baseline = false;

    Shape.prototype.flagReset.call(this);

    return this;

  }

  // -----------------
  // Utils
  // -----------------

  clone(parent) {
    if(!parent) { parent = this.parent; }
    var clone = shapeFN.clone(this, new Text(this.value), PROPS);
    parent.add(clone);
    return clone;
  }

  toObject() {
    return shapeFN.toObject(this, {}, PROPS);
  }
}

shapeFN.defineSecretAccessors(Text.prototype, PROPS, {flags: FLAG_DEFAULTS});
Object.keys(PROP_DEFAULTS).forEach((k) => { Text.prototype['_'+k] = PROP_DEFAULTS[k]; });

export default Text;
