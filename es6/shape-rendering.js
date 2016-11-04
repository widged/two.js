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

FN.updateShape = (shape) => {
  if(!shape || typeof shape._update !== "function") { return; }
  shape._update();
  return shape;
};


// --------------------
// PROPS
// --------------------

FN.defineSecretAccessors = ({proto, accessors, secrets}) => {
  if(!accessors) { accessors = []; }
  if (!isArray(accessors)) { accessors = [accessors]; }
  if(secrets)       { proto.setState(secrets); }
  var each =   (k) => {
    Object.defineProperty(proto, k, {
      enumerable: true,
      set(v) {
        console.log(`[WARN] use set state, ${k}, ${proto.toString()}, ${accessors}`)
        console.trace();
        var o = {}; o[k] = v;
        this.setState(o);
      }
    });
  };

  accessors.forEach(each);

};

FN.getShapeProps = (shape, ks) => {
  var {getMatrixProp} = FN;
  var acc = {};
  ks.forEach((k) => {
    var m;
    if(typeof shape.getState === 'function') {
      var obj = shape.getState();
      m = obj[k];
    }
    if(m === undefined) {
      // console.log('[WARN] getState failed', k, shape.toString())
      m = shape['_' + k];
    }
    if(m === undefined && shape.hasOwnProperty(k)) {
      m = shape[k];
    }
    if(typeof m !== 'undefined') { acc[k] = m; }
  });
  return acc;
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
    m = setDefaultShapeKey(shape, k, v, dontReplace);
    if(m !== undefined) { acc[k] = m; }

  });
  return acc;
};


NotInUse.defaultAndGetShapeProps = (shape, defaults, dontReplace) => {
  return FN.setValueAndGetShapeProps(shape, defaults, true);

};
