import _  from '../util/common';
import is  from '../util/is';

var {copyKeys} = _;
var {isNumber, isString} = is;

const PROPS = [
  'offset',
  'opacity',
  'color'
];

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

  clone() {
    return copyKeys(PROPS, this, new Stop());
  }

  toObject() {
    return copyKeys(PROPS, this, {});
  }

}

export default Stop;