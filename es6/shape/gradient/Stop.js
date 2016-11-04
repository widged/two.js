/* jshint esnext: true */

import is  from '../../util/is';
import DefaultValues from '../../constant/DefaultValues';

var {isNumber, isString} = is;

var stopIndex = 0;

const DEFAULTS = DefaultValues.Stop;

/**
 * This is a class for defining how gradients are colored. By itself a `Stop`
 * doesn't render anything specifically to the screen.
 */
class Stop {

  /**
   *  A stop takes a 0 to 1 offset value which defines where on the trajectory
   * of the gradient the full color is rendered. It also takes a color which is
   * a css string representing the color value and an optional opacity which is
   * also a 0 to 1 value.
   */
  constructor(offset, color, opacity) {
    this.state = {renderer : {}};
    // offset -- A 0 to 1 offset value which defines where on the trajectory of the gradient the full color is rendered.
    this.offset  = isNumber(offset) ? offset : stopIndex <= 0 ? 0 : 1;
    // opacity -- A 0 to 1 value which defines the opacity of the stop. This only renders in `svg` mode.
    this.opacity = isNumber(opacity) ? opacity : 1;
    // color -- A css string that represents the color of the stop.
    this.color   = isString(color) ? color : stopIndex <= 0 ? '#fff' : '#000';
    stopIndex = (stopIndex + 1) % 2;
  }

  // -----------------
  // IRenderable
  // -----------------

   /**
   * Returns a new `Stop`.
   */
  clone() {
    var shp = this;
    var clone = new Stop();
    Object.keys(DEFAULTS).forEach((k) => {  clone[k] = shp[k]; });
    return clone;
  }

  toObject() {
    var shp = this;
    var obj = {};
    Object.keys(DEFAULTS).forEach((k) => {  obj[k] = shp[k]; });
    return obj;
  }

}



export default Stop;
