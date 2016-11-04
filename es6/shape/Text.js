/* jshint esnext: true */

import _  from '../util/common';
import is  from '../util/is';
import Shape from '../Shape';
import shapeFN    from '../shape-fn';
import pathFN    from '../shape/fn-path';
import DefaultValues from '../constant/DefaultValues';
import shapeRendering   from '../shape-rendering';

var {defineSecretAccessors, updateShape} = shapeRendering;
var {isNumber, isObject} = is;

var {shimBoundingClientRect, serializeProperties} = shapeFN;
var {getComputedMatrix} = pathFN;

const DEFAULTS = DefaultValues.Text;

/**
 * A `Text` captures the properties of a textual on screen element.
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

    this.state.renderer.type = 'text';
    this.setState(DEFAULTS);

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

    this.state.changeTracker.raise(['family','size','leading','alignment','baseline','style','weight','decoration']);

  }


  // --------------------
  // Accessors
  // --------------------
  get clip() {
    return this.state.clip;
  }
  set clip(v) {
    this.state.clip = v;
    this.state.changeTracker.raise(['clip']);
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
    var shp = this;
    // TODO: Update this to not __always__ update. Just when it needs to.
    updateShape(shp, true);
    var {matrix} = shp.getState();
    if(!shallow) { matrix = getComputedMatrix(shp); }
    return shimBoundingClientRect(matrix);
  }

  // -----------------
  // IRenderable
  // -----------------

  flagReset() {
    super.flagReset();
    this.state.changeTracker.drop(['value','family','size','leading','alignment','fill','stroke','linewidth','opacity','visible','clip','decoration']);
    return this;

  }

  /**
  * Returns a new instance of a Two.Text with the same settings.
  */
  clone(parent) {
    var shp = this;
    if(!parent) { parent = shp.parent; }
    var {value} = shp.getState();
    var clone = new Text(value);
    Object.keys(DEFAULTS).forEach((k) => {  clone[k] = shp[k]; });
    parent.add(clone);
    return clone;
  }

  toObject() {
    var shp = this;
    return serializeProperties(shp, {}, Object.keys(DEFAULTS));
  }
}


export default Text;
