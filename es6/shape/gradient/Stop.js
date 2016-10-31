/* jshint esnext: true */

import is  from '../../util/is';

var {isNumber, isString} = is;

var stopIndex = 0;

class Stop {

  constructor(offset, color, opacity) {

    this._renderer = {};

    this.offset = isNumber(offset) ? offset
      : stopIndex <= 0 ? 0 : 1;

    this.opacity = isNumber(opacity) ? opacity : 1;

    this.color = isString(color) ? color
      : stopIndex <= 0 ? '#fff' : '#000';

    stopIndex = (stopIndex + 1) % 2;
  }

  // -----------------
  // IRenderable
  // -----------------

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
