/* jshint esnext: true */

import _  from '../util/common';
import EventEmitter  from '../util/EventEmitter';
import VectorEvent    from '../constant/VectorEvent';

/*

This is the atomic coordinate representation for two.js. A Two.Vector is different and specific to two.js because its main properties, x and y, trigger events which allow the renderers to efficiently change only when they need to. Unless specified methods return their instance of Two.Vector for the purpose of chaining.
construction var vector = new Two.Vector(x, y);
x vector.x
The x value of the vector.
y vector.y
The y value of the vector.
set vector.set(x, y);
Set the x, y properties of the vector to the arguments x, y.
copy vector.copy(v);
Set the x, y properties of the vector from another vector, v.
clear vector.clear();
Set the x, y properties of the vector to 0.
clone vector.clone();
Returns a new instance of a Two.Vector with the same x, y values as the instance.
add vector.add(v1, v2);
Add to vectors together. The sum of the x, y values will be set to the instance.
addSelf vector.addSelf(v);
Add the x, y values of the instance to the values of another vector. Set the sum to the instance's values.
sub vector.sub(v1, v2);
Subtract two vectors. Set the difference to the instance.
subSelf vector.subSelf(v);
Subtract a vector, v, from the instance.
multiplySelf vector.multiplySelf(v);
Multiply the x, y values of the instance by another vector's, v, x, y values.
multiplyScalar vector.multiplyScalar(value);
Multiply the x, y values of the instance by another number, value.
divideScalar vector.divideScalar(value);
Divide the x, y values of the instance by another number, value.
negate vector.negate();
Toggle the sign of the instance's x, y values.
dot vector.dot(v);
Return the dot product of the instance and a vector, v.
lengthSquared vector.lengthSquared();
Return the length of the vector squared.
length vector.length();
Return the length of the vector.
normalize vector.normalize();
Reduce the length of the vector to the unit circle.
distanceTo vector.distanceTo(v);
Return the distance from the instance to another vector, v.
distanceToSquared vector.distanceToSquared(v);
Return the distance squared from the instance to another vector, v.
setLength vector.setLength(length);
Set the length of a vector to a specified distance, length.
equals vector.equals(v);
Return a boolean representing whether or not the vectors are within 0.0001 of each other. This fuzzy equality helps with Physics libraries.
lerp vector.lerp(v, t);
Linear interpolation of the instance's current x, y values to the destination vector, v, by an amount, t. Where t is a value 0-1.
isZero vector.isZero();
Returns a boolean describing the length of the vector less than 0.0001.
*/
class Vector  {

  constructor(x, y) {
    this.dispatcher = new EventEmitter([VectorEvent.change]);

    this._x = this.x = x || 0;
    this._y = this.y = y || 0;
  }

  get x() { return this._x; }
  set x(v){
    this._x = v;
    this.whenChange('x');
    return this;
  }

  get y() { return this._y; }
  set y(v) {
    this._y = v;
    this.whenChange('y');
    return this;
  }

  whenChange(attributeName) {
    this.dispatcher.emit(VectorEvent.change, attributeName);
  }

  set(x, y) {
    this._x = x;
    this._y = y;
    this.whenChange();
    return this;
  }

  copy(v) {
    this._x = v.x;
    this._y = v.y;
    this.whenChange();
    return this;
  }

  clear() {
    this._x = 0;
    this._y = 0;
    this.whenChange();
    return this;
  }

  clone() {
    return new Vector(this._x, this._y);
  }

  add(v1, v2) {
    this._x = v1.x + v2.x;
    this._y = v1.y + v2.y;
    this.whenChange();
    return this;
  }

  addSelf(v) {
    this._x += v.x;
    this._y += v.y;
    this.whenChange();
    return this;
  }

  sub(v1, v2) {
    this._x = v1.x - v2.x;
    this._y = v1.y - v2.y;
    this.whenChange();
    return this;
  }

  subSelf(v) {
    this._x -= v.x;
    this._y -= v.y;
    this.whenChange();
    return this;
  }

  multiplySelf(v) {
    this._x *= v.x;
    this._y *= v.y;
    this.whenChange();
    return this;
  }

  multiplyScalar(s) {
    this._x *= s;
    this._y *= s;
    this.whenChange();
    return this;
  }

  divideScalar(s) {
    if (s) {
      this._x /= s;
      this._y /= s;
      this.whenChange();
      return this;
    }
    return this.clear();
  }

  negate() {
    return this.multiplyScalar(-1);
  }

  dot(v) {
    return this._x * v.x + this._y * v.y;
  }

  lengthSquared() {
    return this._x * this._x + this._y * this._y;
  }

  length() {
    return Math.sqrt(this.lengthSquared());
  }

  normalize() {
    return this.divideScalar(this.length());
  }

  distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(v) {
    var dx = this._x - v.x,
        dy = this._y - v.y;
    return dx * dx + dy * dy;
  }

  setLength(l) {
    return this.normalize().multiplyScalar(l);
  }

  equals(v, eps) {
    eps = (typeof eps === 'undefined') ?  0.0001 : eps;
    return (this.distanceTo(v) < eps);
  }

  lerp(v, t) {
    var x = (v.x - this._x) * t + this._x;
    var y = (v.y - this._y) * t + this._y;
    return this.set(x, y);
  }

  isZero(eps) {
    eps = (typeof eps === 'undefined') ?  0.0001 : eps;
    return (this.length() < eps);
  }

  toString() {
    return this._x + ',' + this._y;
  }

  toObject() {
    return { x: this._x, y: this._y };
  }

}

Vector.zero = new Vector();


export default Vector;
