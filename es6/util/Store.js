/* jshint esnext: true */

var activeUid = 0;
var ks = [];
var vs = [];

var FN = {};
FN.create = (getItem) => {
  if(typeof getItem !== 'function') {
   throw 'Store.create expects a function as argument. That function gets passed an uid that can be used to destroy the store';
 }
  var item;
  var uid = activeUid; activeUid += 1;
  var idx = ks.indexOf(uid);
  if(idx !== -1) {
    throw '[ERROR] a new, unique id should have been created';
  } else {
    idx = ks.length;
    item = getItem(uid);
    vs[idx] = item;
  }
  return item;
};

FN.destroy = (uid) => {
  var idx = ks.indexOf(uid);
  if(idx !== -1) {
    vs.splice(idx, 1);
    ks.splice(idx, 1);
  }
};


export default FN;
