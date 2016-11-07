/* jshint esnext: true */

import EventEmitter  from '../event-emitter/EventEmitter';
import VectorEventTypes    from './VectorEventTypes';
import Vector2    from './Vector2';

/**
 * A Vector2Evented captures coordinates. A `Vector2Evented` is specific to two.js because its
 * main properties, x and y, trigger events which allow the renderers to efficiently
 * change only when they need to. By default, setting methods return their instance
 * of `Vector2Evented` for the purpose of chaining.
 */
 class Vector2Evented extends Vector2  {

  /**
  * construction var vector = new Two.Vector2Evented(x, y);
  * x -- The x value of the vector.
  * y -- The y value of the vector.
  */
  constructor(x, y) {
    super(x,y);
    this.intern = { dispatcher : undefined, };
    this.whenChange('pt');
  }

  get x() { return this.state.x; }
  set x(_){
    let {x,y} = this.state;
    this.state.x = x;
    this.whenChange('pt', {x,y});
    return this;
  }

  get y() { return this.state.y; }
  set y(v) {
    let {x,y} = this.state;
    this.state.y = y;
    this.whenChange('pt', {x,y});
    return this;
  }

  get dispatcher()    { return this.intern.dispatcher; }

  whenChange(attributeName, oldXY) {
    let {x,y} = this.state;
    if(!oldXY || x !== oldXY.x || y !== oldXY.y) {
      if(!this.intern.dispatcher) { this.intern.dispatcher = new EventEmitter([VectorEventTypes.change]); }
      this.intern.dispatcher.emit(VectorEventTypes.change);
    }
  }

  /**
  Set the x, y properties of the vector to the arguments x, y.
  */
  set(x1, y2) {
    const {x,y} = this.state;
    super.set(x1,y2);
    this.whenChange('pt', {x,y});
    return this;
  }


  /**
  * Set the x, y properties of the vector from another vector, v.
  */
  copy(v) {
    let {x,y} = this.state;
    super.copy(v);
    this.whenChange('pt', {x,y});
    return this;
  }

  /**
  * Set the x, y properties of the vector to 0.
  */
  clear() {
    let {x,y} = this.state;
    super.clear();
    this.whenChange('pt', {x,y});
    return this;
  }


  /**
  * Add to vectors together. The sum of the x, y values will be set to the instance.
  */
  add(v1, v2) {
    let {x,y} = this.state;
    super.add(v1, v2);
    this.whenChange('pt', {x,y});
    return this;
  }

  /**
  * Add the x, y values of the instance to the values of another vector. Set the sum to the instance's values.
  */
  addSelf(v) {
    let {x,y} = this.state;
    super.addSelf(v);
    this.whenChange('pt', {x,y});
    return this;
  }

  /**
  * Subtract two vectors. Set the difference to the instance.
  */
  sub(v1, v2) {
    let {x,y} = this.state;
    super.sub(v1, v2);
    this.whenChange('pt', {x,y});
    return this;
  }

  /**
  * Subtract a vector, v, from the instance.
  */
  subSelf(v) {
    let {x,y} = this.state;
    super.subSelf(v);
    this.whenChange('pt', {x,y});
    return this;
  }

  /**
  * Multiply the x, y values of the instance by another vector's, v, x, y values.
  */
  multiplySelf(v) {
    let {x,y} = this.state;
    super.multiplySelf(v);
    this.whenChange('pt', {x,y});
    return this;
  }

  /**
  * Multiply the x, y values of the instance by another number, value.
  */
  multiplyScalar(s) {
    let {x,y} = this.state;
    super.multiplyScalar(s);
    this.whenChange('pt', {x,y});
    return this;
  }

  /**
  * Divide the x, y values of the instance by another number, value.
  */
  divideScalar(s) {
    let {x,y} = this.state;
    let r = super.divideScalar(s);
    this.whenChange('pt', {x,y});
    return r;
  }

  /**
  * Toggle the sign of the instance's x, y values.
  */
  negate() {
    let {x,y} = this.state;
    let r = super.negate();
    this.whenChange('pt', {x,y});
    return r;
  }

  /**
  * Reduce the length of the vector to the unit circle.
  */
  normalize() {
    let {x,y} = this.state;
    let r = super.normalize();
    this.whenChange('pt', {x,y});
    return r;
  }


  /**
  setLength vector.setLength(length);
  Set the length of a vector to a specified distance, length.
  */
  setLength(l) {
    let {x,y} = this.state;
    let r = super.setLength(l);
    this.whenChange('pt', {x,y});
    return r;
  }

  /**
  * Linear interpolation of the instance's current x, y values to the destination
  * vector, v, by an amount, t. Where t is a value 0-1.
  */
  lerp(v, t) {
    let {x,y} = this.state;
    let r = super.lerp(v, t);
    this.whenChange('pt', {x,y});
    return r;
  }


}


export default Vector2Evented;
