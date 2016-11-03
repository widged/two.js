/* jshint esnext: true */

import is  from './util/is';
import _  from './util/common';
import Commands  from './constant/CommandTypes';
import VectorEvent   from './constant/VectorEvent';
import Vector  from './struct/Vector';

var {isNumber, isObject} = is;

  /**
   * Taken from the Adobe Illustrator nomenclature an `Anchor` holds 3 `Vector`s:
   * the anchor point and its `left` and `right` handles: .
   * An anchor provides renderers information about what action to take when
   * plotting points. It inherits all properties and methods from `Vector`.
   * For curves, anchors also define the control points of bezier curves.
   */



 class Anchor extends Vector {

   /**
   * new Two.Anchor(x, y, lx, ly, rx, ry, command);
   *  - x,y are initial positions of x and y to orient the point.
   * - command is the command describes the plotting action to perform when rendering.
   * - config encodes any extra configuration data for the plotting action. CURVE
   *   is the only command that requires extra config data.
   */
  constructor(x, y, command, config) {
    super(x,y);
    // x  -- The x value of the anchor's position.
    this.x = x || 0;
    // y  -- The y value of the anchor's position.
    this.y = y || 0;
    // command  -- The command for the given anchor. It must be one of `CommandsTypes`.
    this.state.command = command || Commands.MOVE;
    this.state.relative = true;

    if (!command) {
      return this;
    }

    // controls  -- An object that exists only for curves. It holds the anchor's control points of the bezier curve. It contains Two
    // parts, {left, right}, the control point to the `left` of the anchor's position and the control point to its right.
      Anchor.AppendCurveProperties(this);

      if(config && command !== 'C') {
        console.log('[WARN] only C expects a config', config, command)
      }

      if(command === 'C') {
        this.controls = {};
        var {left, right} = config || {};
        if (isNumber(left.x)) {
          this.controls.left.x = left.x;
        }
        if (isNumber(left.y)) {
          this.controls.left.y = left.y;
        }
        if (isNumber(right.x)) {
          this.controls.right.x = right.x;
        }
        if (isNumber(right.y)) {
          this.controls.right.y = right.y;
        }
      }

  }

  get command() {
    return this.state.command;
  }

  set command(c) {
    this.state.command = c;
    if (this.state.command === Commands.CURVE && !isObject(this.controls)) {
      Anchor.AppendCurveProperties(this);
    }
    this.whenChange();
  }

  get relative() {
    return this.state.relative;
  }

  set relative(b) {
    if (this.state.relative == b) { return this; }
    this.state.relative = !!b;
    this.whenChange();
    return;
  }

   whenChange() {
      this.dispatcher.emit(VectorEvent.change);
   }

   /**
   * Convenience method to add event bubbling to an attached path.
   */
  listen() {
    if (!isObject(this.controls)) {
      Anchor.AppendCurveProperties(this);
    }
    this.controls.left.dispatcher.on(VectorEvent.change, this.whenChange);
    this.controls.right.dispatcher.on(VectorEvent.change, this.whenChange);
    return this;
  }

  /**
  * Convenience method to remove event bubbling to an attached path.
  */
  ignore() {
    this.controls.left.dispatcher.off(VectorEvent.change, this.whenChange);
    this.controls.right.dispatcher.off(VectorEvent.change, this.whenChange);
    return this;
  }

  /**
   Returns a new instance of an `Anchor` with the same x, y, controls, and command values as the instance.
  */
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
    clone.relative = this.state.relative;
    return clone;

  }

  toObject() {
    var o = {
      x: this.x,
      y: this.y
    };
    if (this.state.command) {
      o.command = this.state.command;
    }
    if (this.state.relative) {
      o.relative = this.state.relative;
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


/**
 * Convenience method to add the controls object.
 */
Anchor.AppendCurveProperties = (anchor) => {
  anchor.controls = {
    left: new Vector(0, 0),
    right: new Vector(0, 0)
  };
};



export default Anchor;
