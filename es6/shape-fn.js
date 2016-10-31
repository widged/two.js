/* jshint esnext: true */

import is  from './util/is';
import _  from './util/common';

var {isArray} = is;

var FN = {};

FN.copyKeys = (source, target, keys) => {
  if(!Array.isArray(keys)) { return target; }
  keys.forEach((k) => { target[k] = source[k]; });
  return target;
};

FN.clone = (source, target, extraProps) => {
  target.translation.copy(source.translation);
  target.rotation = source.rotation;
  target.scale = source.scale;
  (extraProps || []).forEach((k) => { target[k] = source[k]; });
  return target;
};

FN.toObject = (source, target, extraProps) => {
  target.translation = source.translation.toObject();
  target.rotation = source.rotation;
  target.scale = source.scale;
  (extraProps || []).forEach((k) => { target[k] = source[k]; });
  return target;
};

FN.cloned     = (shape) => {
  if(!shape) { return; }
  var clone;
  if (typeof shape.clone === 'function') {
    clone = shape.clone();
  } else if(Array.isArray(shape)) {
    clone = shape.map(FN.cloned);
  }
  return clone;
};

FN.serialized = (shape) => {
  if(!shape) { return; }
  var obj;
  if (typeof shape.toObject === 'function') {
     obj = shape.toObject();
   } else  if(Array.isArray(shape)) {
     obj = shape.map(FN.serialized);
   } else {
     obj = shape;
   }
  return obj;
};

FN.secretAccessor = (k) => { return '_'+k; };
FN.flagAccessor   = (k) => { return '_flag_'+k; };

FN.defineSecretAccessors = ({proto, accessors, secrets, flags, onlyWhenChanged}) => {
  if(!accessors) { accessors = []; }
  if (!isArray(accessors)) { accessors = [accessors]; }

  var {secretAccessor, flagAccessor} = FN;
  if(flags)   {  Object.keys(flags || {}).forEach((k) => { k = flagAccessor(k); proto[k] = flags[k]; return; } );       }

  var each =   (k) => {
    var secret = secretAccessor(k);
    var flag   = flagAccessor(k);
    var onChange = Array.isArray(onlyWhenChanged) && onlyWhenChanged.includes(k);
    if(secrets) { proto[secretAccessor(k)] = secrets[k]; }

    Object.defineProperty(proto, k, {
      enumerable: true,
      get() {
        return this[secret];
      },
      set(v) {
        if(!onChange || v !== this[secret]) {
          this[secret] = v;
          this[flag] = true;
        }
      }
    });

  };

  accessors.forEach(each);

};

export default FN;
