/* jshint esnext: true */

import is   from '../util/is';
import LinearGradient from '../gradient/LinearGradient';
import RadialGradient from '../gradient/RadialGradient';
import Group from './Group';
import Path from './Path';
import Text from './Text';
import Anchor from '../Anchor';

var {isNumber, isArray} = is;

var FN = {};

FN.makeText = (message, x, y, styles) => {
  return new Text(message, x, y, styles);
};

FN.makeLinearGradient = (x1, y1, x2, y2, stops) => {
  return new LinearGradient(x1, y1, x2, y2, stops);
};


FN.makeRadialGradient = (x1, y1, r, stops) => {
  return new RadialGradient(x1, y1, r, stops);
};

FN.makePath = (p) => {
  var l = arguments.length, points = p;
  if (!isArray(p)) {
    points = [];
    for (var i = 0; i < l; i+=2) {
      var x = arguments[i];
      if (!isNumber(x)) {
        break;
      }
      var y = arguments[i + 1];
      points.push(new Anchor(x, y));
    }
  }

  var last = arguments[l - 1];
  return new Path(points, !(is.isBoolean(last) ? last : undefined));
};

FN.makeCurve = (p) => {
  var l = arguments.length, points = p;
  if (!isArray(p)) {
    points = [];
    for (var i = 0; i < l; i+=2) {
      var x = arguments[i];
      if (!isNumber(x)) {
        break;
      }
      var y = arguments[i + 1];
      points.push(new Anchor(x, y));
    }
  }
  var last = arguments[l - 1];
  return new Path(points, !(is.isBoolean(last) ? last : undefined), true);

};

FN.makeGeometry = (points) => {
  points = points.map((d) => {  return new Anchor(...d); });
  return new Path(points, true);
};

FN.makeGroup = () => {
  return new Group();
};

export default FN;
