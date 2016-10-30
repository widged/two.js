/* jshint esnext: true */

import is  from './util/is';
import _  from './util/common';
import Commands  from './constant/CommandTypes';
import VectorEvent   from './constant/VectorEvent';
import Vector  from './struct/Vector';

var {isNumber, isObject} = is;

  /**
   * An object that holds 3 `Vector`s, the anchor point and its
   * corresponding handles: `left` and `right`.
   */
 class Anchor extends Vector {

  constructor(x, y, ux, uy, vx, vy, command) {
    super(x,y);
    this.x = x || 0;
    this.y = y || 0;

    this._command = command || Commands.move;
    this._relative = true;

    if (!command) {
      return this;
    }

    Anchor.AppendCurveProperties(this);

    if (isNumber(ux)) {
      this.controls.left.x = ux;
    }
    if (isNumber(uy)) {
      this.controls.left.y = uy;
    }
    if (isNumber(vx)) {
      this.controls.right.x = vx;
    }
    if (isNumber(vy)) {
      this.controls.right.y = vy;
    }

  }

  get command() {
    return this._command;
  }

  set command(c) {
    this._command = c;
    if (this._command === Commands.curve && !isObject(this.controls)) {
      Anchor.AppendCurveProperties(this);
    }
    this.whenChange();
  }

  get relative() {
    return this._relative;
  }

  set relative(b) {
    if (this._relative == b) { return this; }
    this._relative = !!b;
    this.whenChange();
    return
  }

   whenChange() {
      this.dispatcher.emit(VectorEvent.change);
   }

  listen() {
    if (!isObject(this.controls)) {
      Anchor.AppendCurveProperties(this);
    }
    this.controls.left.dispatcher.on(VectorEvent.change, this.whenChange);
    this.controls.right.dispatcher.on(VectorEvent.change, this.whenChange);
    return this;
  }

  ignore() {
    this.controls.left.dispatcher.off(VectorEvent.change, this.whenChange);
    this.controls.right.dispatcher.off(VectorEvent.change, this.whenChange);
    return this;
  }

  clone() {

    var controls = this.controls;

    var clone = new Anchor(
      this.x,
      this.y,
      controls && controls.left.x,
      controls && controls.left.y,
      controls && controls.right.x,
      controls && controls.right.y,
      this.command
    );
    clone.relative = this._relative;
    return clone;

  }

  toObject() {
    var o = {
      x: this.x,
      y: this.y
    };
    if (this._command) {
      o.command = this._command;
    }
    if (this._relative) {
      o.relative = this._relative;
    }
    if (this.controls) {
      o.controls = {
        left: this.controls.left.toObject(),
        right: this.controls.right.toObject()
      };
    }
    return o;
  }

 }

Anchor.AppendCurveProperties = (anchor) => {
  anchor.controls = {
    left: new Vector(0, 0),
    right: new Vector(0, 0)
  };
};



export default Anchor;
