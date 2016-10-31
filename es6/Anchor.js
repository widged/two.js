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

   /*
   Taken from the Adobe Illustrator nomenclature a Two.Anchor represents an anchor point in two.js. This class delineates to the renderer what action to take when plotting points. It inherits all properties and methods from Two.Vector. As a result, Two.Anchor can be used as such. Depending on its command, anchor points may or may not have corresponding control points to describe how their bezier curves should be rendered.
   construction var anchor = new Two.Anchor(x, y, lx, ly, rx, ry, command);
   A Two.Anchor can take initial positions of x and y to orient the point. lx and ly describe where the left control point will reside. Likewise rx and ry describe where the right control point will reside. Finally, the command describes what action the renderer will take once rendering. A more detailed description of commands can be found on the w3c and the available commands in two.js can be found under Two.Commands.
    Two.Anchor is introduced to two.js as of v0.3.0
   x anchor.x
   The x value of the anchor's position.
   y anchor.y
   The y value of the anchor's position.
   command anchor.command
   The command for the given anchor.
   controls anchor.controls
   An object that exists only when anchor.command is Two.Commands.curve. It holds the anchor's control point Two.Vectors and describes what the make up of the curve will be.
   right anchor.controls.right
   A Two.Vector that represents the position of the control point to the “right” of the anchor's position. To further clarify, if you were to orient the anchor so that it was normalized and facing up, this control point would be to the right of it.
   left anchor.controls.left
   A Two.Vector that represents the position of the control point to the “left” of the anchor's position. To further clarify, if you were to orient the anchor so that it was normalized and facing up, this control point would be to the left of it.
   clone anchor.clone();
   Returns a new instance of a Two.Anchor with the same x, y, controls, and command values as the instance.
   listen anchor.listen();
   Convenience method to add event bubbling to an attached path.
   ignore anchor.ignore();
   Convenience method to remove event bubbling to an attached path.
   AppendCurveProperties Anchor.AppendCurveProperties();
   Convenience method to add the controls object.
   Two.Stop
   This is a class for defining how gradients are colored in two.js. By itself a Two.Stop doesn't render anything specifically to the screen.
   construction var stop = new Two.Stop(offset, color, opacity);
   A stop takes a 0 to 1 offset value which defines where on the trajectory of the gradient the full color is rendered. It also takes a color which is a css string representing the color value and an optional opacity which is also a 0 to 1 value.
   offset stop.offset
   A 0 to 1 offset value which defines where on the trajectory of the gradient the full color is rendered.
   color stop.color
   A css string that represents the color of the stop.
   opacity stop.opacity
   A 0 to 1 value which defines the opacity of the stop.
    This only renders in the Two.Types.svg mode.
   clone stop.clone();
   Clones a stop. Returns a new Two.Stop.
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
