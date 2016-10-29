var FN = {};


FN.isArguments = (obj) =>  {
  return toString.call(obj) === '[object Arguments]';
};
FN.isFunction = (obj) =>  {
  return toString.call(obj) === '[object Function]';
};

FN.isString = (obj) =>  {
  return toString.call(obj) === '[object String]';
};

FN.isNumber = (obj) =>  {
  return toString.call(obj) === '[object Number]';
};

FN.isDate = (obj) =>  {
  return toString.call(obj) === '[object Date]';
};

FN.isRegExp = (obj) =>  {
  return toString.call(obj) === '[object RegExp]';
};

FN.isError = (obj) =>  {
  return toString.call(obj) === '[object Error]';
};

FN.isFinite = (obj) =>  {
  return isFinite(obj) && !isNaN(parseFloat(obj));
};

FN.isNaN = (obj) =>  {
  return FN.isNumber(obj) && obj !== +obj;
};

FN.isBoolean = (obj) =>  {
  return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
};

FN.isNull = (obj) =>  {
  return obj === null;
};

FN.isUndefined = (obj) =>  {
  return obj === void 0;
};

FN.isEmpty = (obj) =>  {
  var {isArrayLike, isArray, isString, isArguments} = FN;
  if (obj == null) return true;
  if (isArrayLike && (isArray(obj) || isString(obj) || isArguments(obj))) return obj.length === 0;
  return Object.keys(obj).length === 0;
};


FN.isArray = Array.isArray || ((obj) => {
  return toString.call(obj) === '[object Array]';
});

FN.isObject = (obj) =>  {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
}

var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

FN.isArrayLike = (collection) =>  {
  var length = collection == null ? void 0 : collection.length;
  return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
}

export default FN;