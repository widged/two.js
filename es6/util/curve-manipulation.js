import Commands from '../constant/CommandTypes';
import Resolution from '../constant/Resolution';
import _ from './common';
import is from './is';
import MathExtras   from './math-extras';
import Vector from '../struct/Vector';
import Matrix from '../struct/Matrix';
import Anchor from '../Anchor';

var slice = _.natural.slice;

var {isObject, isNumber} = is;

var Curve = {

  CollinearityEpsilon: Math.pow(10, -30),

  RecursionLimit: 16,

  CuspLimit: 0,

  Tolerance: {
    distance: 0.25,
    angle: 0,
    epsilon: 0.01
  },

  // Lookup tables for abscissas and weights with values for n = 2 .. 16.
  // As values are symmetric, only store half of them and adapt algorithm
  // to factor in symmetry.
  abscissas: [
    [  0.5773502691896257645091488],
    [0,0.7745966692414833770358531],
    [  0.3399810435848562648026658,0.8611363115940525752239465],
    [0,0.5384693101056830910363144,0.9061798459386639927976269],
    [  0.2386191860831969086305017,0.6612093864662645136613996,0.9324695142031520278123016],
    [0,0.4058451513773971669066064,0.7415311855993944398638648,0.9491079123427585245261897],
    [  0.1834346424956498049394761,0.5255324099163289858177390,0.7966664774136267395915539,0.9602898564975362316835609],
    [0,0.3242534234038089290385380,0.6133714327005903973087020,0.8360311073266357942994298,0.9681602395076260898355762],
    [  0.1488743389816312108848260,0.4333953941292471907992659,0.6794095682990244062343274,0.8650633666889845107320967,0.9739065285171717200779640],
    [0,0.2695431559523449723315320,0.5190961292068118159257257,0.7301520055740493240934163,0.8870625997680952990751578,0.9782286581460569928039380],
    [  0.1252334085114689154724414,0.3678314989981801937526915,0.5873179542866174472967024,0.7699026741943046870368938,0.9041172563704748566784659,0.9815606342467192506905491],
    [0,0.2304583159551347940655281,0.4484927510364468528779129,0.6423493394403402206439846,0.8015780907333099127942065,0.9175983992229779652065478,0.9841830547185881494728294],
    [  0.1080549487073436620662447,0.3191123689278897604356718,0.5152486363581540919652907,0.6872929048116854701480198,0.8272013150697649931897947,0.9284348836635735173363911,0.9862838086968123388415973],
    [0,0.2011940939974345223006283,0.3941513470775633698972074,0.5709721726085388475372267,0.7244177313601700474161861,0.8482065834104272162006483,0.9372733924007059043077589,0.9879925180204854284895657],
    [  0.0950125098376374401853193,0.2816035507792589132304605,0.4580167776572273863424194,0.6178762444026437484466718,0.7554044083550030338951012,0.8656312023878317438804679,0.9445750230732325760779884,0.9894009349916499325961542]
  ],

  weights: [
    [1],
    [0.8888888888888888888888889,0.5555555555555555555555556],
    [0.6521451548625461426269361,0.3478548451374538573730639],
    [0.5688888888888888888888889,0.4786286704993664680412915,0.2369268850561890875142640],
    [0.4679139345726910473898703,0.3607615730481386075698335,0.1713244923791703450402961],
    [0.4179591836734693877551020,0.3818300505051189449503698,0.2797053914892766679014678,0.1294849661688696932706114],
    [0.3626837833783619829651504,0.3137066458778872873379622,0.2223810344533744705443560,0.1012285362903762591525314],
    [0.3302393550012597631645251,0.3123470770400028400686304,0.2606106964029354623187429,0.1806481606948574040584720,0.0812743883615744119718922],
    [0.2955242247147528701738930,0.2692667193099963550912269,0.2190863625159820439955349,0.1494513491505805931457763,0.0666713443086881375935688],
    [0.2729250867779006307144835,0.2628045445102466621806889,0.2331937645919904799185237,0.1862902109277342514260976,0.1255803694649046246346943,0.0556685671161736664827537],
    [0.2491470458134027850005624,0.2334925365383548087608499,0.2031674267230659217490645,0.1600783285433462263346525,0.1069393259953184309602547,0.0471753363865118271946160],
    [0.2325515532308739101945895,0.2262831802628972384120902,0.2078160475368885023125232,0.1781459807619457382800467,0.1388735102197872384636018,0.0921214998377284479144218,0.0404840047653158795200216],
    [0.2152638534631577901958764,0.2051984637212956039659241,0.1855383974779378137417166,0.1572031671581935345696019,0.1215185706879031846894148,0.0801580871597602098056333,0.0351194603317518630318329],
    [0.2025782419255612728806202,0.1984314853271115764561183,0.1861610000155622110268006,0.1662692058169939335532009,0.1395706779261543144478048,0.1071592204671719350118695,0.0703660474881081247092674,0.0307532419961172683546284],
    [0.1894506104550684962853967,0.1826034150449235888667637,0.1691565193950025381893121,0.1495959888165767320815017,0.1246289712555338720524763,0.0951585116824927848099251,0.0622535239386478928628438,0.0271524594117540948517806]
  ]

}

var FN = {};
var NotInUse = {};

/**
 * Return the computed matrix of a nested object.
 * TODO: Optimize traversal.
 */
FN.getComputedMatrix = (object, matrix) => {

  matrix = (matrix && matrix.identity()) || new Matrix();
  var parent = object, matrices = [];

  while (parent && parent._matrix) {
    matrices.push(parent._matrix);
    parent = parent.parent;
  }

  matrices.reverse();

  _.each(matrices, function(m) {

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

  var PI = Math.PI;

  var atan2 = Math.atan2, sqrt = Math.sqrt;

  // calculate delta transform point
  var px = deltaTransformPoint(matrix, 0, 1);
  var py = deltaTransformPoint(matrix, 1, 0);

  // calculate skew
  var skewX = ((180 / PI) * Math.atan2(px.y, px.x) - 90);
  var skewY = ((180 / PI) * Math.atan2(py.y, py.x));

  return {
      translateX: matrix.e,
      translateY: matrix.f,
      scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
      scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
      skewX: skewX,
      skewY: skewY,
      rotation: skewX // rotation is the same as skew x
  };

};
      

/**
 * Given 2 points (a, b) and corresponding control point for each
 * return an array of points that represent points plotted along
 * the curve. Number points determined by limit.
 */
FN.subdivide = (x1, y1, x2, y2, x3, y3, x4, y4, limit) => {

  var {getPointOnCubicBezier} = FN;

  limit = limit || Curve.RecursionLimit;
  var amount = limit + 1;

  // TODO: Issue 73
  // Don't recurse if the end points are identical
  if (x1 === x4 && y1 === y4) {
    return [[x4, y4]];
  }

  return _.map(_.range(0, amount), function(i) {

    var t = i / amount;
    var x = getPointOnCubicBezier(t, x1, x2, x3, x4);
    var y = getPointOnCubicBezier(t, y1, y2, y3, y4);

    return [x, y];

  });

}

FN.getPointOnCubicBezier = (t, a, b, c, d)  => {
  var k = 1 - t;
  return (k * k * k * a) + (3 * k * k * t * b) + (3 * k * t * t * c) +
     (t * t * t * d);
},

/**
 * Given 2 points (a, b) and corresponding control point for each
 * return a float that represents the length of the curve using
 * Gauss-Legendre algorithm. Limit iterations of calculation by `limit`.
 */
FN.getCurveLength = (x1, y1, x2, y2, x3, y3, x4, y4, limit)  => {

  var {integrate} = FN;

  var sqrt = Math.sqrt;

  // TODO: Better / fuzzier equality check
  // Linear calculation
  if (x1 === x2 && y1 === y2 && x3 === x4 && y3 === y4) {
    var dx = x4 - x1;
    var dy = y4 - y1;
    return sqrt(dx * dx + dy * dy);
  }

  // Calculate the coefficients of a Bezier derivative.
  var ax = 9 * (x2 - x3) + 3 * (x4 - x1),
    bx = 6 * (x1 + x3) - 12 * x2,
    cx = 3 * (x2 - x1),

    ay = 9 * (y2 - y3) + 3 * (y4 - y1),
    by = 6 * (y1 + y3) - 12 * y2,
    cy = 3 * (y2 - y1);

  var integrand = function(t) {
    // Calculate quadratic equations of derivatives for x and y
    var dx = (ax * t + bx) * t + cx,
      dy = (ay * t + by) * t + cy;
    return sqrt(dx * dx + dy * dy);
  };

  return integrate(
    integrand, 0, 1, limit || Curve.RecursionLimit
  );

}

/**
 * Utility functions
 */

FN.getCurveLengthAB = (a, b, limit) => {
  // TODO: DRYness
  var x1, x2, x3, x4, y1, y2, y3, y4;

  var right = b.controls && b.controls.right;
  var left = a.controls && a.controls.left;

  x1 = b.x;
  y1 = b.y;
  x2 = (right || b).x;
  y2 = (right || b).y;
  x3 = (left || a).x;
  y3 = (left || a).y;
  x4 = a.x;
  y4 = a.y;

  if (right && b._relative) {
    x2 += b.x;
    y2 += b.y;
  }

  if (left && a._relative) {
    x3 += a.x;
    y3 += a.y;
  }

  return _.getCurveLength(x1, y1, x2, y2, x3, y3, x4, y4, limit);

}

/**
 * Integration for `getCurveLength` calculations. Referenced from
 * Paper.js: https://github.com/paperjs/paper.js/blob/master/src/util/Numerical.js#L101
 */
FN.integrate = (f, a, b, n)  => {
  var x = Curve.abscissas[n - 2],
    w = Curve.weights[n - 2],
    A = 0.5 * (b - a),
    B = A + a,
    i = 0,
    m = (n + 1) >> 1,
    sum = n & 1 ? w[i++] * f(B) : 0; // Handle odd n
  while (i < m) {
    var Ax = A * x[i];
    sum += w[i++] * (f(B + Ax) + f(B - Ax));
  }
  return A * sum;
}

/**
 * Creates a set of points that have u, v values for anchor positions
 */
FN.getCurveFromPoints = (points, closed)  => {

  var {getControlPoints, mod} = FN;
  var {min,max, mod} = Math;

  var l = points.length, last = l - 1;

  for (var i = 0; i < l; i++) {

    var point = points[i];

    if (!isObject(point.controls)) {
      Anchor.AppendCurveProperties(point);
    }

    var prev = closed ? mod(i - 1, l) : max(i - 1, 0);
    var next = closed ? mod(i + 1, l) : min(i + 1, last);

    var a = points[prev];
    var b = point;
    var c = points[next];
    getControlPoints(a, b, c);

    b._command = i === 0 ? Commands.move : Commands.curve;

    b.controls.left.x = isNumber(b.controls.left.x) ? b.controls.left.x : b.x;
    b.controls.left.y = isNumber(b.controls.left.y) ? b.controls.left.y : b.y;

    b.controls.right.x = isNumber(b.controls.right.x) ? b.controls.right.x : b.x;
    b.controls.right.y = isNumber(b.controls.right.y) ? b.controls.right.y : b.y;

  }

}

/**
 * Given three coordinates return the control points for the middle, b,
 * vertex.
 */
FN.getControlPoints = (a, b, c)  => {
  var {angleBetween, distanceBetween} = MathExtras;
  var {sin, cos} = Math;

  var PI = Math.PI, HALF_PI = PI / 2;

  var a1 = angleBetween(a, b);
  var a2 = angleBetween(c, b);

  var d1 = distanceBetween(a, b);
  var d2 = distanceBetween(c, b);

  var mid = (a1 + a2) / 2;

  // So we know which angle corresponds to which side.

  b.u = isObject(b.controls.left) ? b.controls.left : new Vector(0, 0);
  b.v = isObject(b.controls.right) ? b.controls.right : new Vector(0, 0);

  // TODO: Issue 73
  if (d1 < 0.0001 || d2 < 0.0001) {
    if (!b._relative) {
      b.controls.left.copy(b);
      b.controls.right.copy(b);
    }
    return b;
  }

  d1 *= 0.33; // Why 0.33?
  d2 *= 0.33;

  if (a2 < a1) {
    mid += HALF_PI;
  } else {
    mid -= HALF_PI;
  }

  b.controls.left.x = cos(mid) * d1;
  b.controls.left.y = sin(mid) * d1;

  mid -= PI;

  b.controls.right.x = cos(mid) * d2;
  b.controls.right.y = sin(mid) * d2;

  if (!b._relative) {
    b.controls.left.x += b.x;
    b.controls.left.y += b.y;
    b.controls.right.x += b.x;
    b.controls.right.y += b.y;
  }

  return b;

};



/**
 * Get the reflection of a point "b" about point "a". Where "a" is in
 * absolute space and "b" is relative to "a".
 *
 * http://www.w3.org/TR/SVG11/implnote.html#PathElementImplementationNotes
 */
FN.getReflection = (a, b, relative)  => {

  return new Vector(
    2 * a.x - (b.x + a.x) - (relative ? a.x : 0),
    2 * a.y - (b.y + a.y) - (relative ? a.y : 0)
  );

}

FN.getSubdivisions = (a, b, limit) => {
    var {subdivide} = curve;
    // TODO: DRYness
    var x1, x2, x3, x4, y1, y2, y3, y4;

    var right = b.controls && b.controls.right;
    var left = a.controls && a.controls.left;

    x1 = b.x;
    y1 = b.y;
    x2 = (right || b).x;
    y2 = (right || b).y;
    x3 = (left || a).x;
    y3 = (left || a).y;
    x4 = a.x;
    y4 = a.y;

    if (right && b._relative) {
      x2 += b.x;
      y2 += b.y;
    }

    if (left && a._relative) {
      x3 += a.x;
      y3 += a.y;
    }

    return subdivide(x1, y1, x2, y2, x3, y3, x4, y4, limit).map((d) => {
      return new Anchor(d);
    });

  }

FN.subdvideTo = (limit, pth) => {
  var {getSubdivisions} = FN;
  var last = pth.vertices.length - 1;
      var b = pth.vertices[last];
      var closed = pth._closed || pth.vertices[last]._command === Commands.close;
      var points = [];
      _.each(pth.vertices, function(a, i) {

        if (i <= 0 && !closed) {
          b = a;
          return;
        }

        if (a.command === Commands.move) {
          points.push(new Anchor(b.x, b.y));
          if (i > 0) {
            points[points.length - 1].command = Commands.line;
          }
          b = a;
          return;
        }

        var verts = getSubdivisions(a, b, limit);
        points = points.concat(verts);

        // Assign commands to all the verts
        _.each(verts, function(v, i) {
          if (i <= 0 && b.command === Commands.move) {
            v.command = Commands.move;
          } else {
            v.command = Commands.line;
          }
        });

        if (i >= last) {

          // TODO: Add check if the two vectors in question are the same values.
          if (this._closed && this._automatic) {

            b = a;

            verts = getSubdivisions(a, b, limit);
            points = points.concat(verts);

            // Assign commands to all the verts
            _.each(verts, function(v, i) {
              if (i <= 0 && b.command === Commands.move) {
                v.command = Commands.move;
              } else {
                v.command = Commands.line;
              }
            });

          } else if (closed) {
            points.push(new Anchor(a.x, a.y));
          }

          points[points.length - 1].command = closed ? Commands.close : Commands.line;

        }

        b = a;

      }, pth);
}

NotInUse.getPointsFromArcData = (center, xAxisRotation, rx, ry, ts, td, ccw)  => {

  var {sin, cos} = Math;

  var matrix = new Matrix()
    .translate(center.x, center.y)
    .rotate(xAxisRotation);

  var l = Resolution;

  // console.log(arguments);

  return _.map(_.range(l), function(i) {

    var pct = (i + 1) / l;
    if (!!ccw) {
      pct = 1 - pct;
    }

    var theta = pct * td + ts;
    var x = rx * cos(theta);
    var y = ry * sin(theta);

    // x += center.x;
    // y += center.y;


    // TODO: Calculate control points here...

    return [x, y, 0, 0, 0, 0, Commands.line];

  });

}

/**
 * Given a float `t` from 0 to 1, return a point or assign a passed `obj`'s
 * coordinates to that percentage on this Path's curve.
 */
NotInUse.getPointAt = (t, obj, pth) => {
      var x, x1, x2, x3, x4, y, y1, y2, y3, y4, left, right;
      var target = pth.length * Math.min(Math.max(t, 0), 1);
      var length = pth.vertices.length;
      var last = length - 1;

      var a = null;
      var b = null;

      for (var i = 0, l = pth._lengths.length, sum = 0; i < l; i++) {

        if (sum + pth._lengths[i] > target) {
          a = pth.vertices[this.closed ? _.mod(i, length) : i];
          b = pth.vertices[Math.min(Math.max(i - 1, 0), last)];
          target -= sum;
          t = target / pth._lengths[i];
          break;
        }

        sum += pth._lengths[i];

      }

      if (isNull(a) || isNull(b)) {
        return null;
      }

      right = b.controls && b.controls.right;
      left = a.controls && a.controls.left;

      x1 = b.x;
      y1 = b.y;
      x2 = (right || b).x;
      y2 = (right || b).y;
      x3 = (left || a).x;
      y3 = (left || a).y;
      x4 = a.x;
      y4 = a.y;

      if (right && b._relative) {
        x2 += b.x;
        y2 += b.y;
      }

      if (left && a._relative) {
        x3 += a.x;
        y3 += a.y;
      }

      x = _.getPointOnCubicBezier(t, x1, x2, x3, x4);
      y = _.getPointOnCubicBezier(t, y1, y2, y3, y4);

      if (is.Object(obj)) {
        obj.x = x;
        obj.y = y;
        return obj;
      }

      return new Vector(x, y);

    }


export default FN;    