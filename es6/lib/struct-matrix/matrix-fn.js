/* jshint esnext: true */

import Matrix   from './Matrix';
import Vector   from '../struct-vector/Vector';

var FN = {};

var {atan2, sqrt, sin, cos, pow, PI, round, min, max} = Math;

FN.getMatrixAndParent = (shp) => {
  return { matrix: shp.getState().matrix, next: shp.parent};
};

/**
 * Return the computed matrix of a nested object.
 * TODO: Optimize traversal.
 */
FN.getComputedMatrix = (obj, getMatrixAndNext) => {

  var {matrix, next} = getMatrixAndNext(obj);
  matrix = (matrix && matrix.identity()) || new Matrix();

  var matrices = [];
  while (obj && matrix) {
    matrices.push(matrix);
    obj    = next;
    let pm = getMatrixAndNext(obj);
    next    = pm.next;
    matrix  = pm.matrix  ;
  }

  matrices.reverse();

  matrices.forEach(function(m) {
    var e = m.elements;
    matrix.multiply(
      e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8], e[9]);
  });

  return matrix;

};


FN.deltaTransformPoint = (matrix, x, y) => {

  var dx = x * matrix.a + y * matrix.c + 0;
  var dy = x * matrix.b + y * matrix.d + 0;

  return new Vector(dx, dy);

};

/**
 * Decomposing a 2D transformation matrix to find the skew
 * https://gist.github.com/2052247
 */
FN.decomposeMatrix = (matrix) => {
  var {deltaTransformPoint} = FN;

  // calculate delta transform point
  var px = deltaTransformPoint(matrix, 0, 1);
  var py = deltaTransformPoint(matrix, 1, 0);

  // calculate skew
  var skewX = ((180 / PI) * atan2(px.y, px.x) - 90);
  var skewY = ((180 / PI) * atan2(py.y, py.x));

  return {
      translateX: matrix.e,
      translateY: matrix.f,
      scaleX: sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
      scaleY: sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
      skewX: skewX,
      skewY: skewY,
      rotation: skewX // rotation is the same as skew x
  };

};

export default FN;