/* jshint esnext: true */

import is from './is';

var {isArray, isArrayLike, isObject} = is;

var FN = {};

// ------------------------
// Arrays, Iterables
// ------------------------

FN.arrayLast = (arr) => {
  var s = arr.length;
  return arr[s-1];
};

// A pretty fast toFixed(3) alternative
// See http://jsperf.com/parsefloat-tofixed-vs-math-round/18
FN.toFixed = (v) => {
  return Math.floor(v * 1000) / 1000;
};

FN.mod = (v, l) => {
  while (v < 0) { v += l; }
  return v % l;
};

FN.exclude = (list) => { return (d) => { return !list.includes(d); }; };

export default FN;
