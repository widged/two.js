/* jshint esnext: true */

import is  from '../../util/is';

var {isNumber, isString} = is;

var stopIndex = 0;

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
    this._renderer = {};
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
    var clone = new Stop();
    Stop.Properties.forEach((k) => {  clone[k] = this[k]; });
    return clone;
  }

  toObject() {
    var obj = {};
    Stop.Properties.forEach((k) => {  obj[k] = this[k]; });
    return obj;
  }

}

Stop.Properties = [
  'offset',
  'opacity',
  'color'
];


export default Stop;
