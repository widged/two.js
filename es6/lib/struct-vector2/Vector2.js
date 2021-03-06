/* jshint esnext: true */

import EventEmitter  from '../event-emitter/EventEmitter';
import VectorEventTypes    from './VectorEventTypes';

/**
 * A Vector2 captures coordinates. A `Vector2` is specific to two.js because its
 * main properties, x and y, trigger events which allow the renderers to efficiently
 * change only when they need to. By default, setting methods return their instance
 * of `Vector2` for the purpose of chaining.
 */
 class Vector2  {

  /**
  * construction var vector = new Two.Vector2(x, y);
  * x -- The x value of the vector.
  * y -- The y value of the vector.
  */
  constructor(x, y) {
    this.intern = {
      dispatcher : undefined,
    };
    this.state = {
      x :  x || 0,
      y : y || 0
    };
  }

  get x() { return this.state.x; }
  set x(v){
    this.state.x = v;
    return this;
  }

  get y() { return this.state.y; }
  set y(v) {
    this.state.y = v;
    return this;
  }

  /**
  Set the x, y properties of the vector to the arguments x, y.
  */
  set(x, y) {
    var pt = this.state;
    this.state.x = x;
    this.state.y = y;
    return this;
  }

  /**
  * Set the x, y properties of the vector from another vector, v.
  */
  copy(v) {
    this.state.x = v.x;
    this.state.y = v.y;
    return this;
  }

  /**
  * Set the x, y properties of the vector to 0.
  */
  clear() {
    this.state.x = 0;
    this.state.y = 0;
    return this;
  }


  /**
  * Add to vectors together. The sum of the x, y values will be set to the instance.
  */
  add(v1, v2) {
    this.state.x = v1.x + v2.x;
    this.state.y = v1.y + v2.y;
    return this;
  }

  /**
  * Add the x, y values of the instance to the values of another vector. Set the sum to the instance's values.
  */
  addSelf({x,y}) {
    this.state.x += x;
    this.state.y += y;
    return this;
  }

  /**
  * Subtract two vectors. Set the difference to the instance.
  */
  sub(v1, v2) {
    this.state.x = v1.x - v2.x;
    this.state.y = v1.y - v2.y;
    return this;
  }

  /**
  * Subtract a vector, v, from the instance.
  */
  subSelf({x,y}) {
    this.state.x -= x;
    this.state.y -= y;
    return this;
  }

  /**
  * Multiply the x, y values of the instance by another vector's, v, x, y values.
  */
  multiplySelf(v) {
    this.state.x *= v.x;
    this.state.y *= v.y;
    return this;
  }

  /**
  * Multiply the x, y values of the instance by another number, value.
  */
  multiplyScalar(s) {
    this.state.x *= s;
    this.state.y *= s;
    return this;
  }

  /**
  * Divide the x, y values of the instance by another number, value.
  */
  divideScalar(s) {
    if (s) {
      this.state.x /= s;
      this.state.y /= s;
      return this;
    }
    return this.clear();
  }

  /**
  * Toggle the sign of the instance's x, y values.
  */
  negate() {
    return this.multiplyScalar(-1);
  }

  /**
  * Return the dot product of the instance and a vector, v.
  */
  dot(v) {
    return this.state.x * v.x + this.state.y * v.y;
  }

  /**
  * Return the length of the vector squared.
  */
  lengthSquared() {
    return this.state.x * this.state.x + this.state.y * this.state.y;
  }

  /**
  * Return the length of the vector.
  */
  length() {
    return Math.sqrt(this.lengthSquared());
  }

  /**
  * Reduce the length of the vector to the unit circle.
  */
  normalize() {
    return this.divideScalar(this.length());
  }

  /**
  * Return the distance from the instance to another vector, v.
  */
  distanceTo({x,y}) {
    var dx = this.state.x - x,
        dy = this.state.y - y;
    var squared = dx * dx + dy * dy;
    return Math.sqrt(squared);
  }

  /**
  setLength vector.setLength(length);
  Set the length of a vector to a specified distance, length.
  */
  setLength(l) {
    return this.normalize().multiplyScalar(l);
  }

  /**
  * Assert whether the vectors are within 0.0001 of each other. This fuzzy
  * equality helps with Physics libraries.
  */
  equals(v, eps) {
    eps = (typeof eps === 'undefined') ?  0.0001 : eps;
    return (this.distanceTo(v) < eps);
  }

  /**
  * Linear interpolation of the instance's current x, y values to the destination
  * vector, v, by an amount, t. Where t is a value 0-1.
  */
  lerp(v, t) {
    var x = (v.x - this.state.x) * t + this.state.x;
    var y = (v.y - this.state.y) * t + this.state.y;
    return this.set(x, y);
  }

  /**
  * Returns a boolean describing the length of the vector less than 0.0001.
  */
  isZero(eps) {
    eps = (typeof eps === 'undefined') ?  0.0001 : eps;
    return (this.length() < eps);
  }

  /**
  * Returns a new instance of a Two.Vector2 with the same x, y values as the instance.
  */
  clone() {
    return new Vector2(this.state.x, this.state.y);
  }

  toObject() {
    return { x: this.state.x, y: this.state.y };
  }

  toString() {
    return this.state.x + ',' + this.state.y;
  }


}

Vector2.serializePoint = (xy) => {
  var pt;
  if(!xy || (!xy.x && !xy.y)) { return pt; }
  var {x,y} = xy;
  if (!isNaN(x) || !isNaN(y)) {
    if(isNaN(x)) { x = 0; }
    if(isNaN(y)) { y = 0; }
    pt = {x,y};
  }
  return pt;
};


export default Vector2;
