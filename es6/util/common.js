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

FN.copyKeys = (source, target, keys) => {
  if(Array.isArray(keys)) {
    for(var i = 0, ni = keys.length, k = ''; i < ni; i++) {
        k = keys[i];
        target[k] = source[k];
    }
  }
  return target;
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



FN.defineFlaggedAccessors = (object, properties, always = true) => {
  if(!properties) { return; }
  if (properties && !isArray(properties)) { properties = [properties]; }

  var each =   function(property) {

    var secret = '_' + property;
    var flag = '_flag' + property.charAt(0).toUpperCase() + property.slice(1);

    Object.defineProperty(object, property, {
      enumerable: true,
      get() {
        return this[secret];
      },
      set(v) {
        if(always || v !== this[secret]) {
          this[secret] = v;
          this[flag] = true;
        }

      }
    });

  };

  properties.forEach(each);

};

FN.defineStyleAccessors = function(object, properties) {

  if (!isArray(properties)) { properties = [properties]; }

  var each = (k) => {
    var secret = '_' + k;
    Object.defineProperty(object, k, {
      enumerable: true,
      get: function() {
        return this[secret];
      },
      set: function(v) {
        this[secret] = v;
      }
    });
  };

  properties.forEach(each);

};

FN.exclude = (list) => { return (d) => { return !list.includes(d); }; };


export default FN;
