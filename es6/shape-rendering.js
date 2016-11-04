/* jshint esnext: true */

var shpKeys = [];
shpKeys = shpKeys.concat(["vertices","stroke","linewidth","fill","opacity","cap","join","miter","closed"]);

var rdrKeys = [];
rdrKeys = rdrKeys.concat(["scale","opacity","rect"]);

var FN = {}, NotInUse = {};

FN.getShapeRenderer = (shape) => {
  return shape._renderer;
};


FN.getMatrixProp = (shape, mtx) => {
  var matrix = shape._matrix;
  var k = mtx.slice(4);
  return matrix[k];
};


FN.getShapeProps = (shape, ks) => {
  var {getMatrixProp} = FN;
  var acc = {};
  ks.forEach((k) => {
    var m;
    if(k.indexOf('mtx_') === 0) {
      m = getMatrixProp(shape, k);
    } else {
      // secret prop
      m = shape['_' + k];
    }
    if(!m && shape.hasOwnProperty(k)) {
      m = shape[k];
    }
    if(typeof m !== 'undefined') { acc[k] = m; }
  });
  return acc;
};

NotInUse.setDefaultShapeKey = (shape, k, v, dontReplace) => {
  var secret = '_' + k;
  if(!shape.hasOwnProperty(secret) || dontReplace) { shape[secret] = v; }
  return shape[secret];
};

NotInUse.setValueAndGetShapeProps = (shape, defaults, dontReplace) => {
  var {setDefaultMatrixKey, setDefaultShapeKey} = FN;
  var acc = {};
  Object.keys(defaults).forEach((k) => {
    var m, v = defaults[k];
    if(k.indexOf('mtx_') === 0) {
      // m = setDefaultMatrixKey(shape, k, v, dontReplace);
    } else {
      m = setDefaultShapeKey(shape, k, v, dontReplace);
    }
    if(m) { acc[k] = m; }

  });
  return acc;
};


NotInUse.defaultAndGetShapeProps = (shape, defaults, dontReplace) => {
  return FN.setValueAndGetShapeProps(shape, defaults, true);

};


FN.updateShape = (shape) => {
  shape._update();
};


var useTracker = true;
FN.anyPropChanged = (shp, keys) => {
  if(useTracker && shp.changeTracker !== undefined) {
    return shp.changeTracker.anyChange(keys);
  } else {
    if(!shp.__flags) { shp.__flags = {}; }
    return keys.filter((k) => {
      return shp.__flags[k] ? true : false;
    }).length ? true : false;
  }
};

FN.raiseFlags = (shp, keys) => {
  if(useTracker && shp.changeTracker !== undefined) {
    shp.changeTracker.raise(keys);
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
