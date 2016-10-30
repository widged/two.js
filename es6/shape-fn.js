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



FN.defineSecretAccessors = (object, properties, {onlyWhenChanged, flags}) => {
  if(!properties) { return; }
  if (properties && !isArray(properties)) { properties = [properties]; }

  var each =   (k) => {
    var secret = '_' + k;

    Object.defineProperty(object, k, {
      enumerable: true,
      get() {
        return this[secret];
      },
      set(v) {
        if(!onlyWhenChanged || v !== this[secret]) {
          this[secret] = v;
          if(flags) { this['_flag_' + k] = flags[k] || true; }
        }

      }
    });

  };

  properties.forEach(each);

};

export default FN;
