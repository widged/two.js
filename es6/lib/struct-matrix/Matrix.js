/* jshint esnext: true */

import is  from '../is/is';
import FloatArray   from '../struct-float-array/FloatArray';

const {isArray} = is;
const {cos, sin, tan} = Math;


/**
 * Matrix contains an array of elements that represent
 * the two dimensional 3 x 3 matrix as illustrated below:
 *
 * =====
 * a b c
 * d e f
 * g h i  // the row is not really used in 2d transformations
 * =====
 *
 * String order is for transform strings: a, d, b, e, c, f
 *
 * @class
 */

class Matrix {
  constructor(a, b, c, d, e, f) {

    this.elements = new FloatArray(9);

    var elements = a;
    if (!isArray(elements)) {
      elements = Array.from(arguments);
    }

    // initialize the elements with default values.
    this.identity().set(elements);
  }


  /**
   * Takes an array of elements or the arguments list itself to
   * set and update the current matrix's elements. Only updates
   * specified values.
   */
  set(a) {

    var elements = a;
    if (!isArray(elements)) {
      elements = Array.from(arguments);
    }

    this.elements = Object.assign(this.elements, elements);
    return this;

  }

  /**
   * Turn matrix to identity, like resetting.
   */
  identity() {
    this.set(Matrix.Identity);
    return this;

  }

  /**
   * Multiply scalar or multiply by another matrix.
   */
  multiply(a, b, c, d, e, f, g, h, i) {

    var elements = arguments, l = elements.length;

    // Multiply scalar

    if (l <= 1) {

      (this.elements || []).each(function(v, i) {
        this.elements[i] = v * a;
      }, this);

      return this;

    }

    if (l <= 3) { // Multiply Vector2Evented

      var x, y, z;
      a = a || 0;
      b = b || 0;
      c = c || 0;
      e = this.elements;

      // Go down rows first
      // a, d, g, b, e, h, c, f, i

      x = e[0] * a + e[1] * b + e[2] * c;
      y = e[3] * a + e[4] * b + e[5] * c;
      z = e[6] * a + e[7] * b + e[8] * c;

      return { x: x, y: y, z: z };

    }

    // Multiple matrix

    var A = this.elements;
    var B = elements;

    var A0 = A[0], A1 = A[1], A2 = A[2];
    var A3 = A[3], A4 = A[4], A5 = A[5];
    var A6 = A[6], A7 = A[7], A8 = A[8];

    var B0 = B[0], B1 = B[1], B2 = B[2];
    var B3 = B[3], B4 = B[4], B5 = B[5];
    var B6 = B[6], B7 = B[7], B8 = B[8];

    this.elements[0] = A0 * B0 + A1 * B3 + A2 * B6;
    this.elements[1] = A0 * B1 + A1 * B4 + A2 * B7;
    this.elements[2] = A0 * B2 + A1 * B5 + A2 * B8;

    this.elements[3] = A3 * B0 + A4 * B3 + A5 * B6;
    this.elements[4] = A3 * B1 + A4 * B4 + A5 * B7;
    this.elements[5] = A3 * B2 + A4 * B5 + A5 * B8;

    this.elements[6] = A6 * B0 + A7 * B3 + A8 * B6;
    this.elements[7] = A6 * B1 + A7 * B4 + A8 * B7;
    this.elements[8] = A6 * B2 + A7 * B5 + A8 * B8;

    return this;

  }

  inverse(out) {

    var a = this.elements;
    out = out || new Matrix();

    var a00 = a[0], a01 = a[1], a02 = a[2];
    var a10 = a[3], a11 = a[4], a12 = a[5];
    var a20 = a[6], a21 = a[7], a22 = a[8];

    var b01 = a22 * a11 - a12 * a21;
    var b11 = -a22 * a10 + a12 * a20;
    var b21 = a21 * a10 - a11 * a20;

    // Calculate the determinant
    var det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) {
      return null;
    }

    det = 1.0 / det;

    out.elements[0] = b01 * det;
    out.elements[1] = (-a22 * a01 + a02 * a21) * det;
    out.elements[2] = (a12 * a01 - a02 * a11) * det;
    out.elements[3] = b11 * det;
    out.elements[4] = (a22 * a00 - a02 * a20) * det;
    out.elements[5] = (-a12 * a00 + a02 * a10) * det;
    out.elements[6] = b21 * det;
    out.elements[7] = (-a21 * a00 + a01 * a20) * det;
    out.elements[8] = (a11 * a00 - a01 * a10) * det;

    return out;

  }

  /**
   * Set a scalar onto the matrix.
   */
  scale(sx, sy) {

    var l = arguments.length;
    if (l <= 1) {
      sy = sx;
    }

    return this.multiply(sx, 0, 0, 0, sy, 0, 0, 0, 1);

  }

 /**
   * Rotate the matrix.
   */
  rotate(radians) {

    var c = cos(radians);
    var s = sin(radians);

    return this.multiply(c, -s, 0, s, c, 0, 0, 0, 1);

  }

  /**
   * Translate the matrix.
   */
  translate(x, y) {

    return this.multiply(1, 0, x, 0, 1, y, 0, 0, 1);

  }

  /*
   * Skew the matrix by an angle in the x axis direction.
   */
  skewX(radians) {

    var a = tan(radians);

    return this.multiply(1, a, 0, 0, 1, 0, 0, 0, 1);

  }

  /*
   * Skew the matrix by an angle in the y axis direction.
   */
  skewY(radians) {

    var a = tan(radians);

    return this.multiply(1, 0, 0, a, 1, 0, 0, 0, 1);

  }

  /**
   * Create a transform string to be used with rendering apis.
   */
  toString(fullMatrix) {
    var temp = [];

    this.toArray(fullMatrix, temp);

    return temp.join(' ');

  }

  /**
   * Create a transform array to be used with rendering apis.
   */
  toArray(fullMatrix, output) {

   var elements = this.elements;
   var hasOutput = !!output;

   var a = parseFloat(elements[0].toFixed(3));
   var b = parseFloat(elements[1].toFixed(3));
   var c = parseFloat(elements[2].toFixed(3));
   var d = parseFloat(elements[3].toFixed(3));
   var e = parseFloat(elements[4].toFixed(3));
   var f = parseFloat(elements[5].toFixed(3));

    if (!!fullMatrix) {

      var g = parseFloat(elements[6].toFixed(3));
      var h = parseFloat(elements[7].toFixed(3));
      var i = parseFloat(elements[8].toFixed(3));

      if (hasOutput) {
        output[0] = a;
        output[1] = d;
        output[2] = g;
        output[3] = b;
        output[4] = e;
        output[5] = h;
        output[6] = c;
        output[7] = f;
        output[8] = i;
        return;
      }

      return [
        a, d, g, b, e, h, c, f, i
      ];
    }

    if (hasOutput) {
      output[0] = a;
      output[1] = d;
      output[2] = b;
      output[3] = e;
      output[4] = c;
      output[5] = f;
      return;
    }

    return [
      a, d, b, e, c, f  // Specific format see LN:19
    ];

  }

  /**
   * Clone the current matrix.
   */
  clone() {
    var a, b, c, d, e, f, g, h, i;

    a = this.elements[0];
    b = this.elements[1];
    c = this.elements[2];
    d = this.elements[3];
    e = this.elements[4];
    f = this.elements[5];
    g = this.elements[6];
    h = this.elements[7];
    i = this.elements[8];

    return new Matrix(a, b, c, d, e, f, g, h, i);

  }
}


Matrix.Identity = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ];

/**
 * Multiply two matrix 3x3 arrays
 */
Matrix.Multiply = (A, B, C) => {

  if (B.length <= 3) { // Multiply Vector2Evented

    var x, y, z, e = A;

    var a = B[0] || 0,
        b = B[1] || 0,
        c = B[2] || 0;

    // Go down rows first
    // a, d, g, b, e, h, c, f, i

    x = e[0] * a + e[1] * b + e[2] * c;
    y = e[3] * a + e[4] * b + e[5] * c;
    z = e[6] * a + e[7] * b + e[8] * c;

    return { x: x, y: y, z: z };

  }

  var A0 = A[0], A1 = A[1], A2 = A[2];
  var A3 = A[3], A4 = A[4], A5 = A[5];
  var A6 = A[6], A7 = A[7], A8 = A[8];

  var B0 = B[0], B1 = B[1], B2 = B[2];
  var B3 = B[3], B4 = B[4], B5 = B[5];
  var B6 = B[6], B7 = B[7], B8 = B[8];

  if(!C) { C = new FloatArray(9); }

  C[0] = A0 * B0 + A1 * B3 + A2 * B6;
  C[1] = A0 * B1 + A1 * B4 + A2 * B7;
  C[2] = A0 * B2 + A1 * B5 + A2 * B8;
  C[3] = A3 * B0 + A4 * B3 + A5 * B6;
  C[4] = A3 * B1 + A4 * B4 + A5 * B7;
  C[5] = A3 * B2 + A4 * B5 + A5 * B8;
  C[6] = A6 * B0 + A7 * B3 + A8 * B6;
  C[7] = A6 * B1 + A7 * B4 + A8 * B7;
  C[8] = A6 * B2 + A7 * B5 + A8 * B8;

  return C;

};

export default Matrix;
