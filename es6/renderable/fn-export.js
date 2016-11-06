/* jshint esnext: true */

var FN = {};

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

export default FN;
