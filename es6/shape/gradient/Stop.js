/* jshint esnext: true */

import is  from '../../util/is';
import DefaultValues from '../../constant/DefaultValues';

var {isNumber, isString} = is;

var stopIndex = 0;

const PROP_DEFAULTS = DefaultValues.Stop;
const PROP_KEYS = Object.keys(PROP_DEFAULTS);

/**
 * A `Stop` defines how gradients are colored. By itself a `Stop`
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
    this.state = { renderer : {} }; // renderer required by renderers. :TODO: remove dependency. Should be shape type, not renderer type
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
    console.log('ONLY CALLED BY USER')
    var shp = this;
    var clone = new Stop();
    for (let i = 0, ni = PROP_KEYS.length, k = null; i < ni; i++) {
      k = PROP_KEYS[i];
      clone[k] = shp[k];
    }
    return clone;
  }

  toObject() {
    console.log('ONLY CALLED BY USER')
    var shp = this;
    var obj = {};
    for (let i = 0, ni = PROP_KEYS.length, k = null; i < ni; i++) {
      k = PROP_KEYS[i];
      obj[k] = shp[k];
    }
    return obj;
  }

}



export default Stop;
