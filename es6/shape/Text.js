/* jshint esnext: true */

import _  from '../util/common';
import is  from '../util/is';
import Shape from '../Shape';
import shapeFN    from '../shape-fn';
import pathFN    from '../shape/path-fn';
import DefaultValues from '../constant/DefaultValues';
import shapeRendering from '../shape-rendering';

var {isNumber, isObject} = is;

var {shimBoundingClientRect, defineSecretAccessors, serializeProperties, cloneProperties} = shapeFN;
var {getComputedMatrix} = pathFN;
var {dropFlags, raiseFlags} = shapeRendering;

/**
 * A class for creating, manipulating, and rendering text dynamically
 * It is rather primitive. You can use custom fonts through @Font Face spec.
 * However, you do not have control over the glyphs themselves. If you'd like
 * to manipulate that specifically it is recommended to use a SVG Interpreter.
 */
class Text extends Shape {

  // --------------------
  // Constructor
  // --------------------

  /**
   * A text object takes in a message, the string representation of what will be
   * displayed. It then takes an x and y number where the text object will be
   * placed in the group. Finally, an optional styles object to apply any other
   * additional styles. Applicable properties can be found in DefaultValues
   */
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

    this.changeTracker.raise(['family','size','leading','alignment','baseline','style','weight','decoration']);

  }

  // --------------------
  // Accessors
  // --------------------
  get clip() {
    return this._clip;
  }
  set clip(v) {
    this._clip = v;
    raiseFlags(this, ['clip']);
  }

  // -----------------
  // Main
  // -----------------

  remove() {

    if (!this.parent) { return this; }

    this.parent.remove(this);

    return this;

  }

 /**
 * Removes the stroke.
 */
  noStroke() {
    this.stroke = 'transparent';
    return this;
  }

  /**
   * Removes the fill.
   */
  noFill() {
    this.fill = 'transparent';
    return this;
  }

  // -----------------
  // IBounded
  // -----------------

  /**
   * A shim for compatibility with matrix math in the various renderers.
   * :TODO: Implement a way to calculate proper bounding boxes of `Text`.
   */
  getBoundingClientRect(shallow) {
    // TODO: Update this to not __always__ update. Just when it needs to.
    this._update(true);
    var matrix = !!shallow ? this._matrix : getComputedMatrix(this);
    return shimBoundingClientRect(matrix);
  }


  // -----------------
  // IRenderable
  // -----------------

  flagReset() {
    super.flagReset();
    this.changeTracker.drop(['value','family','size','leading','alignment','fill','stroke','linewidth','opacity','visible','clip','decoration']);
    return this;

  }

  /**
  * Returns a new instance of a Two.Text with the same settings.
  */
  clone(parent) {
    if(!parent) { parent = this.parent; }
    var clone = cloneProperties(this, new Text(this.value), Text.Properties);
    parent.add(clone);
    return clone;
  }

  toObject() {
    return serializeProperties(this, {}, Text.Properties);
  }
}

Text.Properties = Object.keys(DefaultValues.Text);
defineSecretAccessors({proto: Text.prototype, accessors: Text.Properties, secrets: DefaultValues.Text} );

export default Text;
