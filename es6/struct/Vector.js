/* jshint esnext: true */

import _  from '../util/common';
import EventEmitter  from '../util/EventEmitter';
import VectorEvent    from '../constant/VectorEvent';

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
