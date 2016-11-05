/* jshint esnext: true */

import _  from '../util/common';
import is  from '../util/is';
import Shape from '../Shape';
import shapeFN    from '../shape-fn';
import pathFN    from '../shape/fn-path';
import DefaultValues from '../constant/DefaultValues';
import shapeRendering   from '../renderer-lib/renderer-bridge';

var {updateShape} = shapeRendering;
var {isNumber, isObject} = is;

var {shimBoundingClientRect, serializeProperties} = shapeFN;
var {getComputedMatrix} = pathFN;

const PROP_DEFAULTS = DefaultValues.Text;
const PROP_KEYS  = Object.keys(PROP_DEFAULTS);

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
    // init
    super({x,y});
    this.setState(PROP_DEFAULTS);
    // this shape
    var {renderer, changeTracker} = this.getState();
    this.setState({
      value: message
    });
    if (isObject(styles)) {
      this.setState(styles);
      changeTracker.raise(['family','size','leading','alignment','baseline','style','weight','decoration']);
    }
    this.state.changeTracker.raise(['clip']);
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
