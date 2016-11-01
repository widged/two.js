/* jshint esnext: true */

import is   from '../util/is';
import LinearGradient from './gradient/LinearGradient';
import RadialGradient from './gradient/RadialGradient';
import Group from './Group';
import Path from './Path';
import Text from './Text';
import Anchor from '../Anchor';
import shapeFN    from '../shape-fn';


var {rectCentroid} = shapeFN;
var {isNumber, isArray} = is;

var FN = {};

FN.text = (message, x, y, styles) => {
  return new Text(message, x, y, styles);
};

FN.linearGradient = (x1, y1, x2, y2, stops) => {
  return new LinearGradient(x1, y1, x2, y2, stops);
};

FN.radialGradient = (x1, y1, r, stops) => {
  return new RadialGradient(x1, y1, r, stops);
};

/**
 * makePath(x1, y1, x2, y2, xN, yN, open);
 * Draws a path to the instance's drawing space. The arguments are a little tricky. It returns a `Path` object.
 * The method accepts any amount of paired x, y values as denoted by the series above. It then checks to see if there is a final argument, a boolean open, which marks whether or not the shape should be open. If true the path will have two clear endpoints, otherwise it will be closed.
 * This method also recognizes the format `makePath(points, open)` where points is an array of `Anchor`'s and open is an optional boolean describing whether or not to expose endpoints. It is imperative if you generate curves this way to make the list of points `Anchor`'s.
 * The Two.Path that this method creates is the base shape for all of the make functions.
 */
FN.path = (p) => {
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


/**
 * Draws a curved path to the instance's drawing space. The arguments are a little tricky. It returns a `Path` object.
 * The method accepts any amount of paired x, y values as denoted by the series above. It then checks to see if there is a final argument, a boolean open, which marks whether or not the shape should be open. If true the curve will have two clear endpoints, otherwise it will be closed.
 * This method also recognizes the format two.makeCurve(points, open) where points is an array of `Anchor`'s and open is an optional boolean describing whether or not to expose endpoints. It is imperative if you generate curves this way to make the list of points `Anchor`'s.
 */
FN.curve = (p) => {
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

FN.geometry = (points) => {
  points = points.map((d) => {  return new Anchor(...d); });
  return new Path(points, true);
};

/**
 * Adds a group to the instance's drawing space. While a group does not have
 * any visible features when rendered it allows for nested transformations on
 * shapes.
 */
FN.group = () => {
  return new Group();
};

FN.centerPath = (pth) => {
  var rect = pth.getBoundingClientRect();
  var {x,y} = rectCentroid;
  pth.center().translation.set(x,y);
  return pth;
};

export default FN;
