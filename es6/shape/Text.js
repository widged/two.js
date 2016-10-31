/* jshint esnext: true */

import _  from '../util/common';
import is  from '../util/is';
import Shape from '../Shape';
import shapeFN    from '../shape-fn';
import pathFN    from '../shape/path-fn';
import DefaultValues from '../constant/DefaultValues';

var {isNumber, isObject} = is;

var {getComputedMatrix} = pathFN;


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
var textDefaults = DefaultValues.Text;

/*
This is a class for creating, manipulating, and rendering text dynamically in Two.js. As such it is rather primitive. You can use custom fonts through @Font Face spec. However, you do not have control over the glyphs themselves. If you'd like to mainpulate that specifically it is recommended to use SVG Interpreter. A text object extends Two.Shape.
construction var text = new Two.Text(message, x, y, styles);
A text object takes in a message, the string representation of what will be displayed. It then takes an x and y number where the text object will be placed in the group. Finally, an optional styles object to apply any other additional styles. Applicable properties to affect can be found in Two.Text.Properties.
value text.value
A string representing the text that will be rendered to the stage.
family text.family
A string representing the css font-family to be applied to the rendered text. Default value is 'sans-serif'.
size text.size
A number representing the text's size to be applied to the rendered text. Default value is 13.
leading text.leading
A number representing the leading, a.k.a. line-height, to be applied to the rendered text. Default value is 17.
alignment text.alignment
A string representing the horizontal alignment to be applied to the rendered text. e.g: 'left', 'right', or 'center'. Default value is 'middle'.
fill text.fill
A string representing the color for the text area to be filled. All valid css representations of color are accepted. Default value is '#000'.
stroke text.stroke
A string representing the color for the text area to be stroked. All valid css representations of color are accepted. Default value is 'transparent'.
linewidth text.linewidth
A number representing the linewidth to be applied to the rendered text. Default value is 1.
style text.style
A string representing the font style to be applied to the rendered text. e.g: 'normal' or 'italic'. Default value is 'normal'.
weight text.weight
A number or string representing the weight to be applied to the rendered text. e.g: 500 or 'normal'. For more information see the Font Weight Specification. Default value is 500.
decoration text.decoration
A string representing the text decoration to be applied to the rendered text. e.g: 'none', 'underlined', or 'strikethrough'. Default value is 'none'
baseline text.baseline
A string representing the vertical aligment to be applied to the rendered text. e.g: 'middle', 'baseline', or 'top'. Default value is 'middle'.
opacity text.opacity
A number representing the opacity of the path. Use strictly for setting. Must be a number 0-1.
visible text.visible
A boolean representing whether the text object is visible or not.
rotation text.rotation
A number that represents the rotation of the text in the drawing space, in radians.
scale text.scale
A number that represents the uniform scale of the text in the drawing space.
translation text.translation
A Two.Vector that represents x, y translation of the text in the drawing space.
clone text.clone();
Returns a new instance of a Two.Text with the same settings.
getBoundingClientRect text.getBoundingClientRect(shallow);
Currently returns an empty object. A shim for compatibility with matrix math in the various renderers.
noFill text.noFill();
Removes the fill.
noStroke text.noStroke();
Removes the stroke.
*/
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
    var clone = shapeFN.clone(this, new Text(this.value), Object.keys(textDefaults));
    parent.add(clone);
    return clone;
  }

  toObject() {
    return shapeFN.toObject(this, {}, Object.keys(textDefaults));
  }
}

shapeFN.defineSecretAccessors({proto: Text.prototype, accessors: Object.keys(textDefaults), flags: FLAG_DEFAULTS, secrets: textDefaults} );

export default Text;
