/* jshint esnext: true */

import is from './is';

var {isArray, isArrayLike, isObject} = is;

var FN = {};

// http://underscorejs.org/ • 1.8.3

FN.bind = function(func, ctx) {
  var args = Array.from(arguments);

  var natural = Function.prototype.bind;
  if (natural && func.bind === natural) {
    return natural.apply(func, args.slice(1));
  }
  args = args.slice(2);
  return function() {
    func.apply(ctx, args);
  };
};



// ------------------------
// Objects
// ------------------------


FN.defaults = function(base) {
  var sources = Array.from(arguments).slice(1);
  for (var i = 0; i < sources.length; i++) {
    var obj = sources[i];
    for (var k in obj) {
      if (base[k] === void 0) {
        base[k] = obj[k];
      }
    }
  }
  return base;
};


// ------------------------
// Arrays, Iterables
// ------------------------

FN.arrayLast = (arr) => {
  var s = arr.length;
  return arr[s-1];
};

FN.range = function(start, stop, step) {
  if (stop == null) {
    stop = start || 0;
    start = 0;
  }
  step = step || 1;

  var length = Math.max(Math.ceil((stop - start) / step), 0);
  var range = Array(length);

  for (var idx = 0; idx < length; idx++, start += step) {
    range[idx] = start;
  }

  return range;
};

var hasKey = function(obj, key) {
  return obj != null && hasOwnProperty.call(obj, key);
};

var listKeys = function(obj) {
  if (!isObject(obj)) {
    return [];
  }
  if (Object.keys) {
    return Object.keys(obj);
  }
  var keys = [];
  for (var k in obj) {
    if (hasKey(obj, k)) {
      keys.push(k);
    }
  }
  return keys;
};

FN.each = function(obj, iteratee, context) {
  var ctx = context || this;
  var keys = !isArrayLike(obj) && listKeys(obj);
  var length = (keys || obj).length;
  for (var i = 0; i < length; i++) {
    var k = keys ? keys[i] : i;
    iteratee.call(ctx, obj[k], k, obj);
  }
  return obj;
};
FN.map = function(obj, iteratee, context) {
  var ctx = context || this;
  var keys = !isArrayLike(obj) && listKeys(obj);
  var length = (keys || obj).length;
  var result = [];
  for (var i = 0; i < length; i++) {
    var k = keys ? keys[i] : i;
    result[i] = iteratee.call(ctx, obj[k], k, obj);
  }
  return result;
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
