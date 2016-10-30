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
  _flag_value: true,
  _flag_family: true,
  _flag_size: true,
  _flag_leading: true,
  _flag_alignment: true,
  _flag_baseline: true,
  _flag_style: true,
  _flag_weight: true,
  _flag_decoration: true,

  _flag_fill: true,
  _flag_stroke: true,
  _flag_linewidth: true,
  _flag_opacity: true,
  _flag_visible: true,

  _flag_clip: false,
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

shapeFN.defineFlaggedAccessors(Text.prototype, PROPS);
Object.defineProperty(Text.prototype, 'clip', {enumerable: true});
Object.keys(FLAG_DEFAULTS).forEach((k) => { Text.prototype[k] = FLAG_DEFAULTS[k]; });
Object.keys(PROP_DEFAULTS).forEach((k) => { Text.prototype[k] = PROP_DEFAULTS[k]; });

export default Text;
