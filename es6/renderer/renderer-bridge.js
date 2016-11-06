/* jshint esnext: true */

import is  from '../lib/is/is';
import Commands  from '../lib/struct-anchor/CommandTypes';
import matrixFN  from '../lib/struct-matrix/matrix-fn';
import rectFN  from '../lib/struct-bounding-rect/bounding-rect-fn';

var {getComputedMatrix} = matrixFN;
var {isArray, isObject} = is;
var {removeRectBorder, includeAnchorInBoundingRect, shimBoundingClientRect} = rectFN;

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
  // TODO: Update to not __always__ update. Just when it needs to.
  updateShape(shp);
  if(pointTowards) {
    orientAnchorsTowards(shp, pointTowards);
  }
};


/**
 * Return an object with top, left, right, bottom, width, and height
 * parameters of the path. Pass true if you're interested in the shallow
 * positioning, i.e in the space directly affecting the object and not where it is nested.
 */
FN.getBoundingClientRect = (shp, shallow) => {
   var {linewidth, vertices: anchors, matrix} = shp.getState();
   let getMatrixAndParent = (shp) => { return { matrix: shp.getState().matrix, next: shp.parent}; };
   if(!shallow) { matrix = getComputedMatrix(shp, getMatrixAndParent); }
   // :TODO: save matrix to avoid unnecessary recomputation?
   var rect = null;
   if(shp.shapeType === 'path') {
     for (var i = 0, ni = anchors.length, v = null; i < ni; i++) {
       v = anchors[i];
       // :REVIEW: WHY multiply?
       // v = matrix.multiply(v.x, v.y, 1);
       rect = includeAnchorInBoundingRect(rect, {x:v.x, y:v.y});
       rect = removeRectBorder(rect, linewidth / 2);
     }
  } else if(shp.shapeType === 'group') {
    var rect = null;
    var {children} = shp.getState();
    for(var i = 0, ni = children.length, child = null; i < ni; i++ ) {
      child = children[i];
      if (!/(linear-gradient|radial-gradient|gradient)/.test(child.shapeType)) {
        // TODO: Update only when it needs to.
        // updateShape(child, true);
        rect = FN.getBoundingClientRect(child, shallow);
        rect = includeAnchorInBoundingRect(rect, {x: rect.left, y: rect.top });
        rect = includeAnchorInBoundingRect(rect, {x: rect.right, y: rect.bottom });
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


FN.orientAnchorsTowards = (shp, pointTowards) => {
  // :TODO: defaults to rectCentroid
  // :REVIEW: this causes unwanted behaviors... optional rather than default behavior?
  var {getBoundingClientRect} = FN;
  var {vertices:anchors} = shp.getState();
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
