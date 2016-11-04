/* jshint esnext: true */

import is  from './util/is';

var {isArray} = is;

var shpKeys = [];
shpKeys = shpKeys.concat(["vertices","stroke","linewidth","fill","opacity","cap","join","miter","closed"]);

var rdrKeys = [];
rdrKeys = rdrKeys.concat(["scale","opacity","rect"]);


var FN = {}, NotInUse = {};

// --------------------
// update and renderer
// --------------------

FN.getShapeRenderer = (shape) => {
  return shape.renderer || (shape.state && shape.state.renderer);
};

FN.updateShape = (shape, isDeep) => {
  if(!shape || typeof shape._update !== "function") { return; }
  shape._update(isDeep);
  return shape;
};


// --------------------
// PROPS
// --------------------

FN.getShapeProps = (shape, ks) => {

  if(typeof shape.getState === 'function') {
    return shape.getState();
  }  else {
    var acc = {};
    ks.forEach((k) => {
      var m = shape[k];
      if(m === undefined) {
        console.log('[WARN] getState failed', k, shape.toString());
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
  if(useTracker && shp.state && shp.state.changeTracker !== undefined) {
    return shp.state.changeTracker.anyChange(keys);
  } else {
    if(!shp.__flags) { shp.__flags = {}; }
    return keys.filter((k) => {
      return shp.__flags[k] ? true : false;
    }).length ? true : false;
  }
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

NotInUse.setValueAndGetShapeProps = (shape, defaults, dontReplace) => {
  var {setDefaultMatrixKey, setDefaultShapeKey} = FN;
  var acc = {};
  Object.keys(defaults).forEach((k) => {
    var m, v = defaults[k];
    m = setDefaultShapeKey(shape, k, v, dontReplace);
    if(m !== undefined) { acc[k] = m; }

  });
  return acc;
};

NotInUse.defaultAndGetShapeProps = (shape, defaults, dontReplace) => {
  return FN.setValueAndGetShapeProps(shape, defaults, true);
};
