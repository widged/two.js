/* jshint esnext: true */

import is  from './util/is';
import _  from './util/common';

var {isArray} = is;

var FN = {};

FN.cloneProperties = (source, target, extraProps) => {
  target.translation.copy(source.translation);
  target.rotation = source.rotation;
  target.scale = source.scale;
  (extraProps || []).forEach((k) => { target[k] = source[k]; });
  return target;
};

FN.serializeProperties = (source, target, extraProps) => {
  target.translation = source.translation.toObject();
  target.rotation = source.rotation;
  target.scale = source.scale;
  (extraProps || []).forEach((k) => { target[k] = source[k]; });
  return target;
};

FN.cloned = (shape) => {
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

FN.defineSecretAccessors = ({proto, accessors, secrets, raisedFlags, onlyWhenChanged}) => {
  if(!accessors) { accessors = []; }
  if (!isArray(accessors)) { accessors = [accessors]; }

  var {secretAccessor, flagAccessor} = FN;
  if(raisedFlags)   {  raisedFlags.forEach((k) => { k = flagAccessor(k); proto[k] = true; return; } );       }

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

/**
 * A shim for compatibility with matrix math in the various renderers.
 * Use for the shapes for which you have no way to calculate proper
 * bounding boxes
 */
FN.shimBoundingClientRect = (matrix) => {

  var left = Infinity, right = -Infinity,
      top = Infinity, bottom = -Infinity;

  var border, l, x, y, i, v;

  v = matrix.multiply(0, 0, 1);

  return {
    top: v.x,
    left: v.y,
    right: v.x,
    bottom: v.y,
    width: 0,
    height: 0
  };

};

FN.getPathBoundingRect = (matrix, border, length, vertices) => {
  var {min, max} = Math;
  var x, y, i, v;

  var left = Infinity, right = -Infinity,
      top = Infinity, bottom = -Infinity;

  if (length <= 0) {
    v = matrix.multiply(0, 0, 1);
    return {
      top: v.y,
      left: v.x,
      right: v.x,
      bottom: v.y,
      width: 0,
      height: 0
    };
  }

  for (i = 0; i < length; i++) {
    v = vertices[i];

    x = v.x;
    y = v.y;

    v = matrix.multiply(x, y, 1);
    top = min(v.y - border, top);
    left = min(v.x - border, left);
    right = max(v.x + border, right);
    bottom = max(v.y + border, bottom);
  }

  return {
    top: top,
    left: left,
    right: right,
    bottom: bottom,
    width: right - left,
    height: bottom - top
  };
};
export default FN;
