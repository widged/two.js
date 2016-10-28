'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _ = {
  // http://underscorejs.org/ • 1.8.3
  _indexAmount: 0,
  natural: {
    slice: Array.prototype.slice,
    indexOf: Array.prototype.indexOf,
    keys: Object.keys,
    bind: Function.prototype.bind,
    create: Object.create
  },
  identity: function identity(value) {
    return value;
  },
  isArguments: function isArguments(obj) {
    return toString.call(obj) === '[object Arguments]';
  },
  isFunction: function isFunction(obj) {
    return toString.call(obj) === '[object Function]';
  },
  isString: function isString(obj) {
    return toString.call(obj) === '[object String]';
  },
  isNumber: function isNumber(obj) {
    return toString.call(obj) === '[object Number]';
  },
  isDate: function isDate(obj) {
    return toString.call(obj) === '[object Date]';
  },
  isRegExp: function isRegExp(obj) {
    return toString.call(obj) === '[object RegExp]';
  },
  isError: function isError(obj) {
    return toString.call(obj) === '[object Error]';
  },
  isFinite: (function (_isFinite) {
    function isFinite(_x) {
      return _isFinite.apply(this, arguments);
    }

    isFinite.toString = function () {
      return _isFinite.toString();
    };

    return isFinite;
  })(function (obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  }),
  isNaN: function isNaN(obj) {
    return _.isNumber(obj) && obj !== +obj;
  },
  isBoolean: function isBoolean(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  },
  isNull: function isNull(obj) {
    return obj === null;
  },
  isUndefined: function isUndefined(obj) {
    return obj === void 0;
  },
  isEmpty: function isEmpty(obj) {
    if (obj == null) return true;
    if (isArrayLike && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  },
  isElement: function isElement(obj) {
    return !!(obj && obj.nodeType === 1);
  },
  isArray: Array.isArray || function (obj) {
    return toString.call(obj) === '[object Array]';
  },
  isObject: function isObject(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  },
  toArray: function toArray(obj) {
    if (!obj) {
      return [];
    }
    if (_.isArray(obj)) {
      return slice.call(obj);
    }
    if (isArrayLike(obj)) {
      return _.map(obj, _.identity);
    }
    return _.values(obj);
  },
  range: function range(start, stop, step) {
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
  },
  indexOf: function indexOf(list, item) {
    if (!!_.natural.indexOf) {
      return _.natural.indexOf.call(list, item);
    }
    for (var i = 0; i < list.length; i++) {
      if (list[i] === item) {
        return i;
      }
    }
    return -1;
  },
  has: function has(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  },
  bind: function bind(func, ctx) {
    var natural = _.natural.bind;
    if (natural && func.bind === natural) {
      return natural.apply(func, slice.call(arguments, 1));
    }
    var args = slice.call(arguments, 2);
    return function () {
      func.apply(ctx, args);
    };
  },
  extend: function extend(base) {
    var sources = slice.call(arguments, 1);
    for (var i = 0; i < sources.length; i++) {
      var obj = sources[i];
      for (var k in obj) {
        base[k] = obj[k];
      }
    }
    return base;
  },
  defaults: function defaults(base) {
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
  },
  keys: function keys(obj) {
    if (!_.isObject(obj)) {
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
  },
  values: function values(obj) {
    var keys = _.keys(obj);
    var values = [];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      values.push(obj[k]);
    }
    return values;
  },
  each: function each(obj, iteratee, context) {
    var ctx = context || this;
    var keys = !isArrayLike(obj) && _.keys(obj);
    var length = (keys || obj).length;
    for (var i = 0; i < length; i++) {
      var k = keys ? keys[i] : i;
      iteratee.call(ctx, obj[k], k, obj);
    }
    return obj;
  },
  map: function map(obj, iteratee, context) {
    var ctx = context || this;
    var keys = !isArrayLike(obj) && _.keys(obj);
    var length = (keys || obj).length;
    var result = [];
    for (var i = 0; i < length; i++) {
      var k = keys ? keys[i] : i;
      result[i] = iteratee.call(ctx, obj[k], k, obj);
    }
    return result;
  },
  once: function once(func) {
    var init = false;
    return function () {
      if (!!init) {
        return func;
      }
      init = true;
      return func.apply(this, arguments);
    };
  },
  after: function after(times, func) {
    return function () {
      while (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  },
  uniqueId: function uniqueId(prefix) {
    var id = ++_._indexAmount + '';
    return prefix ? prefix + id : id;
  }
};

var slice = _.natural.slice,
    isArrayLike = _.isArrayLike;

var isArrayLike = function isArrayLike(collection) {
  var length = getLength(collection);
  return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
};

var getLength = function getLength(obj) {
  return obj == null ? void 0 : obj['length'];
};

var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

exports['default'] = _;
module.exports = exports['default'];