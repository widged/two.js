import _  from '../util/underscore';
import EventEmitter  from '../util/EventEmitter.js';
import EventTypes    from '../constant/EventTypes';

class Vector {

  constructor(x, y) {
    this._x = this.x = x || 0;
    this._y = this.y = y || 0;
    this.emitter;
  }

  get x() { return this._x; }
  set x(v){
    this._x = v;
    this.dispatchChange('x');
    return this;
  }

  get y() { return this._y; }
  set y(v) {
    this._y = v;
    this.dispatchChange('y');
    return this;
  }

  dispatchChange(v) {
    //  Do not broadcast events unless event listeners are explicity bound to it.
    if(!this.emitter) { return; }
    this.emitter.trigger(EventTypes.change, v);
  }

  on(name, callback) {
    if(![EventTypes.change].includes(name)) { return; }
    if(!this.emitter) { this.emitter = new EventEmitter(); }
    this.emitter.on(name, callback);
    if(!this._bound) {
      this._x = this.x;
      this._y = this.y;
      this._bound = true; // Reserved for event initialization check
    }
    return this;
  }  

  off(name, callback) {
    if(!this.emitter) { return; }
    this.emitter.off(name, callback);
  }

  set(x, y) {
    this._x = x;
    this._y = y;
    this.dispatchChange();
    return this;
  }

  copy(v) {
    this._x = v.x;
    this._y = v.y;
    this.dispatchChange();
    return this;
  }

  clear() {
    this._x = 0;
    this._y = 0;
    this.dispatchChange();
    return this;
  }

  clone() {
    return new Vector(this._x, this._y);
  }

  add(v1, v2) {
    this._x = v1.x + v2.x;
    this._y = v1.y + v2.y;
    this.dispatchChange();
    return this;
  }

  addSelf(v) {
    this._x += v.x;
    this._y += v.y;
    this.dispatchChange();
    return this;
  }

  sub(v1, v2) {
    this._x = v1.x - v2.x;
    this._y = v1.y - v2.y;
    this.dispatchChange();
    return this;
  }

  subSelf(v) {
    this._x -= v.x;
    this._y -= v.y;
    this.dispatchChange();
    return this;
  }

  multiplySelf(v) {
    this._x *= v.x;
    this._y *= v.y;
    this.dispatchChange();
    return this;
  }

  multiplyScalar(s) {
    this._x *= s;
    this._y *= s;
    this.dispatchChange();
    return this;
  }

  divideScalar(s) {
    if (s) {
      this._x /= s;
      this._y /= s;
      this.dispatchChange();
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