/* jshint esnext: true */

import is  from '../lib/is/is';
import Commands  from '../lib/struct-anchor/CommandTypes';
import matrixFN  from '../lib/struct-matrix/matrix-fn';
import rectFN  from '../lib/struct-bounding-rect/bounding-rect-fn';

const {getComputedMatrix} = matrixFN;
const {isArray, isObject} = is;
const {removeRectBorder, includePointInBoundingRect, shimBoundingClientRect} = rectFN;
const {round} = Math;

const FN = {}, NotInUse = {};

// --------------------
// preprocess
// --------------------

FN.preprocess = (shp) => {
  const {updateShape, orientAnchorsTowards} = FN;
  const {pointTowards} = shp.getProps();
  // TODO: Update to not __always__ update. Just when it needs to.
  updateShape(shp);
  if(pointTowards) {
    orientAnchorsTowards(shp, pointTowards);
  }
};

FN.orientAnchorsTowards = (shp, pointTowards) => {
  // :TODO: defaults to rectCentroid
  // :REVIEW: it causes unwanted behaviors... optional rather than default behavior?
  const {getBoundingClientRect} = FN;
  var {anchorColl:anchors} = shp.getProps();
  var pt;
  if(typeof pointTowards === "function") {
    pt = pointTowards(getBoundingClientRect(shp, true));
  } else if (isObject(pointTowards) && pointTowards.x && pointTowards.y) {
    pt = pointTowards;
  }
  if(pt) {
    for (var i = 0, ni = (anchors || []).length , v = null; i < ni; i++) {
      anchors[i].subSelf({x: pt.x,y: pt.y});
    }
  }

};

// --------------------
// update and renderer
// --------------------

FN.getShapeRenderer = (shp) => {
  return shp.renderer || (shp.state && shp.state.renderer);
};

FN.updateShape = (shp, isDeep) => {
  const {updateShape, updateAnyShape, updatePath, plotPath} = FN;
  if(!shp) { return; }
  if(shp.shapeType === 'path') {
    let changed = shp.changed;
    if(changed) { shp = updatePath(shp);  }
    if (shp.getProps().automatic) { plotPath(shp); }
    updateAnyShape(shp, isDeep);

  } else {
    updateAnyShape(shp, isDeep);
  }
  return shp;
};


FN.updatePath = (shp) => {
  const {copyVertices} = FN;
  const {changeTracker} = shp.getState();
  const {anchorColl, beginning, ending, automatic} = shp.getProps();
  if(changeTracker.oneChange('anchors'))  {
    var anchors = anchorColl.items;
    anchors = copyVertices({ anchors, beginning, ending });
    shp.setProps({anchorColl: anchors});
  }
  return shp;
};



FN.copyVertices = ({anchors, beginning, ending}) => {
  var l = anchors.length;
  var last = l - 1, v;

  var ia = round((beginning) * last);
  var ib = round((ending) * last);

  var lst = [];
  for (var i = ia; i < ib + 1; i++) {
    v = anchors[i];
    lst.push(v);
  }

  return lst;

};

/**
 * Based on closed / curved and sorting of `anchors` plot where all points
 * should be and where the respective handles should be too.
 * If curved goes through the `anchors` and calculates the curve.
 * If not, then goes through the `anchors` and calculates the lines.
 */
FN.plotPath = (shp) => {
  var {anchorColl, closed, curved} = shp.getProps();
  if (curved) {
    matrixFN.getCurveFromPoints(anchorColl, closed);
    return shp;
  }
  var anchors = anchorColl.items;
  for (var i = 0; i < anchors.length; i++) {
    anchors[i].command = i === 0 ? Commands.MOVE : Commands.LINE;
  }
  return shp;
};

/**
 * To be called before render that calculates and collates all information
 * to be as up-to-date as possible for the render. Called once a frame.
 */
FN.updateAnyShape = (shp, deep) => {
  const {getShapeMatrix} = FN;
  var matrix = getShapeMatrix(shp);
  const {changeTracker} = shp.getState();
  var {translation, scale, rotation} = shp.getProps();
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



/**
 * Return an object with top, left, right, bottom, width, and height
 * parameters of the path. Pass true if you're interested in the shallow
 * positioning, i.e in the space directly affecting the object and not where it is nested.
 */
FN.getBoundingClientRect = (shp, shallow) => {
   const {getShapeMatrix} = FN;
   var matrix = getShapeMatrix(shp);
   var {linewidth, anchorColl: anchors} = shp.getProps();
   let getMatrixAndParent = (shp) => { return { matrix: getShapeMatrix(shp), next: shp.parent}; };
   if(!shallow) { matrix = getComputedMatrix(shp, getMatrixAndParent); }
   // :TODO: save matrix to avoid unnecessary recomputation?
   var rect = null;
   if(shp.shapeType === 'path') {
     for (let i = 0, ni = anchors.length, a = null; i < ni; i++) {
       a = anchors[i];
       // :REVIEW: WHY multiply?
       // v = matrix.multiply(v.x, v.y, 1);
       rect = includePointInBoundingRect(rect, {x: a.x, y: a.y});
       rect = removeRectBorder(rect, linewidth / 2);
     }
  } else if(shp.shapeType === 'group') {
    rect = null;
    var {childrenColl} = shp.getState();
    for(let i = 0, ni = childrenColl.length, child = null; i < ni; i++ ) {
      child = childrenColl[i];
      if (!/(linear-gradient|radial-gradient|gradient)/.test(child.shapeType)) {
        // TODO: Update only when it needs to.
        // updateShape(child, true);
        rect = FN.getBoundingClientRect(child, shallow);
        rect = includePointInBoundingRect(rect, {x: rect.left, y: rect.top });
        rect = includePointInBoundingRect(rect, {x: rect.right, y: rect.bottom });
      }
    }
    rect = removeRectBorder(rect, 0); // will add width and height
  }
   if(!rect) {
     let {x,y} = matrix.multiply(0, 0, 1);
     rect = shimBoundingClientRect();
   }
   return rect;
 };





// --------------------
// PROPS
// --------------------

FN.getShapeMatrix = (shp) => {
  return (shp && shp.getState) ? shp.getState().matrix : undefined;
};


FN.getShapeProps = (shp, ks) => {
  if(typeof shp.getProps === 'function') {
    return shp.getProps();
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
