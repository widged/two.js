/* jshint esnext: true */

import IMPORTS    from '../_imports';
import Renderable from '../Renderable';

const {ChildrenCollection} = IMPORTS;
const {Anchor, Vector, VectorEventTypes} = IMPORTS;
const {RenderableDefaults} = IMPORTS;
const {is, rectFN, exportFN, matrixFN, shapeRendering} = IMPORTS;

const {isObject, isUndefined, isNumber} = is;
const {shimBoundingClientRect} = rectFN;
const {serializeProperties} = exportFN;
const {getComputedMatrix}   = matrixFN;
const {updateShape}         = shapeRendering;

const PROP_DEFAULTS = RenderableDefaults.Text;
const PROP_KEYS  = Object.keys(PROP_DEFAULTS);

/**
 * A `Text` captures the properties of a textual on screen element.
 * It is rather primitive. You can use custom fonts through @Font Face spec.
 * However, you do not have control over the glyphs themselves. If you'd like
 * to manipulate that specifically it is recommended to use a SVG Interpreter.
 */
class Text extends Renderable {

  // --------------------
  // Constructor
  // --------------------

  /**
   * A text object takes in a message, the string representation of what will be
   * displayed. It then takes an x and y number where the text object will be
   * placed in the group. Finally, an optional styles object to apply any other
   * additional styles. Applicable properties can be found in RenderableDefaults
   */
  constructor(message, x, y, styles) {
    // init
    super();
    var props = PROP_DEFAULTS;
    if (isObject(styles))     { props = Object.assign(props, styles); }
    if(!isUndefined(message)) { props.value = message; }
    if (isNumber(x) || isNumber(y)) { props.translation = {x: x || 0,y: y || 0}; }
    this.setProps(props);
  }

  // -----------------
  // Pseudo props setters
  // -----------------

  /**
  * Removes the stroke.
  */
   noStroke() {
     this.setState({stroke: 'transparent'});
     return this;
   }

   /**
    * Removes the fill.
    */
   noFill() {
     this.setState({fill: 'transparent'});
     return this;
   }

  // -----------------
  // IRenderable
  // -----------------

  get shapeType() { return 'text'; }

  flagReset() {
    super.flagReset();
    this.state.changeTracker.drop(Object.keys(PROP_DEFAULTS));
    return this;
  }

  // -----------------
  // IExportable
  // -----------------

  /**
  * Returns a new instance of a Two.Text with the same settings.
  */
  // :NOTE: Not used internally, only called by the user
  clone() {
    var shp = this;
    var {value} = shp.getState();
    var clone = new Text(value);
    for (let i = 0, ni = PROP_KEYS.length, k = null; i < ni; i++) {
      k = PROP_KEYS[i];
      clone[k] = shp[k];
    }
    return clone;
  }

  // :NOTE: Not used internally, only called by the user
  toObject() {
    var shp = this;
    return serializeProperties(shp, {}, Object.keys(PROP_DEFAULTS));
  }
}

export default Text;
