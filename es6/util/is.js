var is = {};


is.Arguments = (obj) =>  {
  return toString.call(obj) === '[object Arguments]';
};
is.Function = (obj) =>  {
  return toString.call(obj) === '[object Function]';
};

is.String = (obj) =>  {
  return toString.call(obj) === '[object String]';
};

is.Number = (obj) =>  {
  return toString.call(obj) === '[object Number]';
};

is.Date = (obj) =>  {
  return toString.call(obj) === '[object Date]';
};

is.RegExp = (obj) =>  {
  return toString.call(obj) === '[object RegExp]';
};

is.Error = (obj) =>  {
  return toString.call(obj) === '[object Error]';
};

is.Finite = (obj) =>  {
  return isFinite(obj) && !isNaN(parseFloat(obj));
};

is.NaN = (obj) =>  {
  return is.Number(obj) && obj !== +obj;
};

is.Boolean = (obj) =>  {
  return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
};

is.Null = (obj) =>  {
  return obj === null;
};

is.Undefined = (obj) =>  {
  return obj === void 0;
};

is.Empty = (obj) =>  {
  if (obj == null) return true;
  if (isArrayLike && (_.isArray(obj) || is.String(obj) || _.isArguments(obj))) return obj.length === 0;
  return _.keys(obj).length === 0;
};

is.Element = (obj) =>  {
  return !!(obj && obj.nodeType === 1);
};

is.Array = Array.isArray || ((obj) => {
  return toString.call(obj) === '[object Array]';
});

is.Object = (obj) =>  {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
}

var getLength = function(obj) {
  return obj == null ? void 0 : obj['length'];
};
var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

is.ArrayLike = (collection) =>  {
  var length = getLength(collection);
  return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
}

export default is;