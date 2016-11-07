/* jshint esnext: true */

import is  from '../is/is';
import Commands  from './CommandTypes';
import VectorEventTypes   from '../struct-vector2/VectorEventTypes';
import Vector2  from '../struct-vector2/Vector2';

const {isNumber, isObject} = is;
const {MOVE, CURVE} = Commands;

/**
 * Taken from the Adobe Illustrator nomenclature an `Anchor` holds 3 `Vector2`s:
 * the anchor point and its `left` and `right` handles: .
 * An anchor provides renderers information about what action to take when
 * plotting points. It inherits all properties and methods from `Vector2`.
 * For curves, anchors also define the control points of bezier curves.
 */
class Anchor extends Vector2 {

   /**
   * new Two.Anchor(x, y, lx, ly, rx, ry, command);
   *  - x,y are initial positions of x and y to orient the point.
   * - command is the command describes the plotting action to perform when rendering.
   * - config encodes any extra configuration data for the plotting action. CURVE
   *   is the only command that requires extra config data.
   */
  constructor(x, y, command, config) {
    super(x,y);

    this.intern.changeMonitor = null;
    // command  -- The command for the given anchor. It must be one of `CommandsTypes`.
    this.state.command = command || MOVE;
    this.state.relative = true;

    if(config && command && command !== 'C') {
      console.log('[WARN] only C expects a config', config, command)
    }

    if(command && command === 'C') {
      Anchor.AppendCurveProperties(this);
      // controls  -- An object that exists only for curves. It holds the anchor's control points of the bezier curve. It contains Two
      // parts, {left, right}, the control point to the `left` of the anchor's position and the control point to its right.
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


  get changeMonitor() { throw 'no direct access'; }
  set changeMonitor(_) {
    this.intern.changeMonitor = _;
  }


  get command() {
    return this.state.command;
  }

  set command(c) {
    this.state.command = c;
    if (this.state.command === CURVE && !isObject(this.controls)) {
      Anchor.AppendCurveProperties(this);
    }
    this.whenChange('command');
  }

  get relative() {
    return this.state.relative;
  }

  set relative(b) {
    if (this.state.relative == b) { return this; }
    this.state.relative = !!b;
    this.whenChange('relative');
    return;
  }

  whenChange(attributeName) {
    // let's comment out, no need to dispatch events
    // super.whenChange(attributeName);
    // :TODO: trigger change when controls (left or right) change .
    if(this.intern.changeMonitor) { this.intern.changeMonitor.change(this); }
  }


  /**
   Returns a new instance of an `Anchor` with the same x, y, controls, and command values as the instance.
  */
  // :NOTE: the code doing the cloning needs to reattach the changeMonitor
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
    left: new Vector2(0, 0),
    right: new Vector2(0, 0)
  };
};



export default Anchor;
