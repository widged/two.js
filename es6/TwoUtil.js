/* jshint esnext: true */

import is from './lib/is/is';

var {isArray, isArrayLike, isObject} = is;

let FN = {};

// ------------------------
// Arrays, Iterables
// ------------------------

/**
 * Allow to pass multiple objects either as array or as multiple arguments
 */
FN.arrayOrArguments = (args)  => {
  if(!args) { return args; }
  if(!Array.isArray(args)) { return args; }
  if(args.length === 1 && Array.isArray(args[0])) { args = args[0]; }
  return args;
};

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

var isNumber = (o) =>  {
  return (typeof o === 'number') || o instanceof Number;
};



export default FN;
