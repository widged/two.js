/* jshint esnext: true */

const FN = {};
/*

  Tests were initially written as toString.call because benchmarks of the time indicated that toString.call()
  was faster. See http://stackoverflow.com/questions/10394929/why-does-underscorejs-use-tostring-call-instead-of-typeof.
  However, that was back in 2010.
  Nowadays, typeof seems to be more efficient.
  See notes in https://github.com/scottrabin/is-js/blob/master/is.js
*/

var toString = Object.prototype.toString;

FN.isArguments = (o) =>  {
  return toString.call(o) === '[object Arguments]';
};

FN.isFunction = (o) =>  {
  return (typeof o === 'function');
};

FN.isString = (o) =>  {
  return (typeof o === 'string') || o instanceof String;
};

FN.isNumber = (o) =>  {
  return (typeof o === 'number') || o instanceof Number;
};

FN.isNotNumber = (o) =>  {
  return FN.isNumber(o) && o !== +o;
};

FN.isBoolean = (o) =>  {
  return o === !!o || o instanceof Boolean;
};

FN.isNull = (o) =>  {
  return o === null;
};

FN.isUndefined = (o) =>  {
  return o === void 0;
};

FN.isObject = (o) =>  {
  return o === Object(o);
};


FN.isArray = Array.isArray || ((o) => {
  return toString.call(o) === '[object Array]';
});

var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

FN.isArrayLike = (o) =>  {
  var length = o == null ? void 0 : o.length;
  return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
};

export default FN;
