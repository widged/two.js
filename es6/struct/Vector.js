import _  from '../util/common';
import EventEmitter  from '../util/EventEmitter';
import EventTypes    from '../constant/EventTypes';

class Vector extends EventEmitter {

  constructor(x, y) {
    super([EventTypes.change]);
    this._x = this.x = x || 0;
    this._y = this.y = y || 0;
    this.emitter;
  }

  get x() { return this._x; }
  set x(v){
    this._x = v;
    this.emit('x');
    return this;
  }

  get y() { return this._y; }
  set y(v) {
    this._y = v;
    this.emit('y');
    return this;
  }

  emit(v) {
    super.emit(EventTypes.change, v);
  }

  on(name, callback) {
    super.on(name, callback)
    if(!this._bound) {
      this._x = this.x;
      this._y = this.y;
      this._bound = true; // Reserved for event initialization check
    }
    return this;
  }  

  set(x, y) {
    this._x = x;
    this._y = y;
    this.emit();
    return this;
  }

  copy(v) {
    this._x = v.x;
    this._y = v.y;
    this.emit();
    return this;
  }

  clear() {
    this._x = 0;
    this._y = 0;
    this.emit();
    return this;
  }

  clone() {
    return new Vector(this._x, this._y);
  }

  add(v1, v2) {
    this._x = v1.x + v2.x;
    this._y = v1.y + v2.y;
    this.emit();
    return this;
  }

  addSelf(v) {
    this._x += v.x;
    this._y += v.y;
    this.emit();
    return this;
  }

  sub(v1, v2) {
    this._x = v1.x - v2.x;
    this._y = v1.y - v2.y;
    this.emit();
    return this;
  }

  subSelf(v) {
    this._x -= v.x;
    this._y -= v.y;
    this.emit();
    return this;
  }

  multiplySelf(v) {
    this._x *= v.x;
    this._y *= v.y;
    this.emit();
    return this;
  }

  multiplyScalar(s) {
    this._x *= s;
    this._y *= s;
    this.emit();
    return this;
  }

  divideScalar(s) {
    if (s) {
      this._x /= s;
      this._y /= s;
      this.emit();
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