/* jshint esnext: true */

import is  from './util/is';

var {isArray} = is;

var FN = {}, NotInUse = {};

// --------------------
// update and renderer
// --------------------

FN.getShapeRenderer = (shp) => {
  return shp.renderer || (shp.state && shp.state.renderer);
};

FN.updateShape = (shp, isDeep) => {
  if(!shp || typeof shp._update !== "function") { return; }
  shp._update(isDeep);
  return shp;
};

// --------------------
// PROPS
// --------------------

FN.getShapeProps = (shp, ks) => {
  if(typeof shp.getState === 'function') {
    return shp.getState();
  }  else {
    var acc = {};
    ks.forEach((k) => {
      var m = shp[k];
      if(m === undefined) {
        console.log('[WARN] getState failed', k, shp.toString());
      }
      if(typeof m !== 'undefined') { acc[k] = m; }
    });
    return acc;
  }
};

// --------------------
// FLAGS
// --------------------

var useTracker = true;
FN.anyPropChanged = (shp, keys) => {
  var out;
  if(typeof shp.getState === 'function') {
    var changeTracker = shp.getState().changeTracker;
    if(changeTracker) { out = changeTracker.anyChange(keys); }
  }
  if (out === undefined) {
    if(!shp.__flags) { shp.__flags = {}; }
    return keys.filter((k) => {
      return shp.__flags[k] ? true : false;
    }).length ? true : false;
  }
  return out;
};

FN.raiseFlags = (shp, keys) => {
  if(useTracker && shp.state && shp.state.changeTracker !== undefined) {
    shp.state.changeTracker.raise(keys);
  } else {
    if(!shp.__flags) { shp.__flags = {}; }
    keys.forEach((k) => {
      shp.__flags[k] = true;
    });
  }
};

FN.dropFlags = (shp, keys) => {
  if(useTracker && shp.changeTracker !== undefined) {
    shp.changeTracker.drop(keys);
  } else {
    if(!shp.__flags) { shp.__flags = {}; }
      keys.forEach((k) => {
        shp.__flags[k] = false;
      });
  }

};

export default FN;
