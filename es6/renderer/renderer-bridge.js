/* jshint esnext: true */

import is  from '../lib/is/is';
import Commands  from '../lib/struct-anchor/CommandTypes';
import matrixFN  from '../lib/struct-matrix/matrix-fn';


var {isArray, isObject} = is;

var FN = {}, NotInUse = {};

// --------------------
// update and renderer
// --------------------

FN.getShapeRenderer = (shp) => {
  return shp.renderer || (shp.state && shp.state.renderer);
};

FN.updateShape = (shp, isDeep) => {
  var {updateShape, updateAnyShape, updatePath} = FN;
  if(!shp) { return; }
  if(shp.shapeType === 'path') {
    updatePath(shp);
    updateAnyShape(shp, isDeep);
  } else {
    updateAnyShape(shp, isDeep);
  }
  return shp;
};


FN.updatePath = (shp) => {
  var {plotPath} = FN;
  var {copyVertices} = FN;
  var {changeTracker,vertices, beginning, ending, automatic} = shp.getState();
  if(changeTracker.oneChange('vertices'))  {
    vertices = copyVertices({ vertices, beginning, ending });
    shp.setProps({vertices});
    if (automatic) { plotPath(shp); }
  }
  return shp;
};

/**
 * Based on closed / curved and sorting of vertices plot where all points
 * should be and where the respective handles should be too.
 * If curved goes through the vertices and calculates the curve.
 * If not, then goes through the vertices and calculates the lines.
 */
FN.plotPath = (shp) => {
  var {vertices, closed, curved} = shp.getState();
  if (curved) {
    matrixFN.getCurveFromPoints(vertices, closed);
    return shp;
  }
  for (var i = 0; i < vertices.length; i++) {
    vertices[i].command = i === 0 ? Commands.MOVE : Commands.LINE;
  }
  return shp;
};


/**
 * To be called before render that calculates and collates all information
 * to be as up-to-date as possible for the render. Called once a frame.
 */
FN.updateAnyShape = (shp, deep) => {
  var {matrix, changeTracker} = shp.getState();
  var {translation, scale, rotation} = shp.getState();
  if (matrix && !matrix.manual && changeTracker.oneChange('matrix')) {
    matrix
      .identity()
      .translate(translation.x, translation.y)
      .scale(scale)
      .rotate(rotation);
  }
  if(!matrix) {
    console.log('[WARN] matrix is undefined', shp.toString());
  }

  if (deep) {
    // Bubble up to parents mainly for `getBoundingClientRect` method.
    FN.updateShape(shp.parent, deep);
  }

  return shp;

};

FN.preprocess = (shp) => {
  var {updateShape, orientAnchorsTowards} = FN;
  var {pointTowards} = shp.getState();
  updateShape(shp);
  if(pointTowards) {
    orientAnchorsTowards(shp, pointTowards);
  }
};

FN.orientAnchorsTowards = (shp, pointTowards) => {
  var {vertices:anchors} = shp.getState();
  var pt;
  if(typeof pointTowards === "function") {
    pt = pointTowards(shp.getBoundingClientRect(true));
  } else if (isObject(pointTowards) && pointTowards.x && pointTowards.y) {
    pt = pointTowards;
  }
  if(pt) {
    for (var i = 0, ni = (anchors || []).length , v = null; i < ni; i++) {
      anchors[i].subSelf({x: pt.x,y: pt.y});
    }
  }

};



FN.copyVertices = ({vertices, beginning, ending}) => {
  var {round} = Math;

  var l = vertices.length;
  var last = l - 1, v;

  var ia = round((beginning) * last);
  var ib = round((ending) * last);

  var lst = [];
  for (var i = ia; i < ib + 1; i++) {
    v = vertices[i];
    lst.push(v);
  }

  return lst;

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
