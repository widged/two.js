/* jshint esnext: true */

import is  from './util/is';

var {isArray} = is;

var FN = {};



FN.clone = (source, target, extraProps) => {
  target.translation.copy(source.translation);
  target.rotation = source.rotation;
  target.scale = source.scale;
  copyKeys(source, target, extraProps);
  return target;
};

FN.toObject = (source, target, extraProps) => {
  target.translation = source.translation.toObject();
  target.rotation = source.rotation;
  target.scale = source.scale;
  copyKeys(source, target, extraProps);
  return target;
};



FN.defineFlaggedAccessors = (object, properties, always = true) => {
  if(!properties) { return; }
  if (properties && !isArray(properties)) { properties = [properties]; }

  var each =   function(property) {

    var secret = '_' + property;
    var flag = '_flag_' + property;

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

export default FN;
