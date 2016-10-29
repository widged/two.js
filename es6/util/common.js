import is from './is';

var {isArray, isArrayLike, isObject} = is;

var _ = {};

// http://underscorejs.org/ • 1.8.3
_._indexAmount = 0;

_.natural = {
  slice: Array.prototype.slice,
  indexOf: Array.prototype.indexOf,
  keys: Object.keys,
  bind: Function.prototype.bind,
  create: Object.create
};

_.identity = function(value) {
  return value;
};

_.bind = function(func, ctx) {
  var natural = _.natural.bind;
  if (natural && func.bind === natural) {
    return natural.apply(func, slice.call(arguments, 1));
  }
  var args = slice.call(arguments, 2);
  return function() {
    func.apply(ctx, args);
  };
};


_.uniqueId = function(prefix) {
  var id = ++_._indexAmount + '';
  return prefix ? prefix + id : id;
};

// ------------------------
// Objects
// ------------------------

_.toArray = function(obj) {
  if (!obj) {
    return [];
  }
  if (isArray(obj)) {
    return slice.call(obj);
  }
  if (isArrayLike(obj)) {
    return _.map(obj, _.identity);
  }
  return _.values(obj);
};


_.has = function(obj, key) {
  return obj != null && hasOwnProperty.call(obj, key);
};

_.keys = function(obj) {
  if (!isObject(obj)) {
    return [];
  }
  if (_.natural.keys) {
    return _.natural.keys(obj);
  }
  var keys = [];
  for (var k in obj) {
    if (_.has(obj, k)) {
      keys.push(k);
    }
  }
  return keys;
};
_.values = function(obj) {
  var keys = _.keys(obj);
  var values = [];
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    values.push(obj[k]);
  }
  return values;
};

_.extend = function(base) {
  var sources = slice.call(arguments, 1);
  for (var i = 0; i < sources.length; i++) {
    var obj = sources[i];
    for (var k in obj) {
      base[k] = obj[k];
    }
  }
  return base;
};
_.defaults = function(base) {
  var sources = slice.call(arguments, 1);
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

_.copyKeys = (keys, source, target) => {
  return keys.reduce(((acc, k) => { acc[k] = source[k]; return acc; }), target);
}


// ------------------------
// Arrays, Iterables
// ------------------------

var slice = _.natural.slice;

_.range = function(start, stop, step) {
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
_.indexOf = function(list, item) {
  if (!!_.natural.indexOf) {
    return _.natural.indexOf.call(list, item);
  }
  for (var i = 0; i < list.length; i++) {
    if (list[i] === item) {
      return i;
    }
  }
  return -1;
};

_.each = function(obj, iteratee, context) {
  var ctx = context || this;
  var keys = !isArrayLike(obj) && _.keys(obj);
  var length = (keys || obj).length;
  for (var i = 0; i < length; i++) {
    var k = keys ? keys[i] : i;
    iteratee.call(ctx, obj[k], k, obj);
  }
  return obj;
};
_.map = function(obj, iteratee, context) {
  var ctx = context || this;
  var keys = !isArrayLike(obj) && _.keys(obj);
  var length = (keys || obj).length;
  var result = [];
  for (var i = 0; i < length; i++) {
    var k = keys ? keys[i] : i;
    result[i] = iteratee.call(ctx, obj[k], k, obj);
  }
  return result;
};

export default _;