import is  from './util/is';
import _  from './util/underscore';
import Commands  from './constant/CommandTypes';
import EventTypes   from './constant/EventTypes';
import Vector  from './struct/Vector';

  /**
   * An object that holds 3 `Vector`s, the anchor point and its
   * corresponding handles: `left` and `right`.
   */
 class Anchor {

  constructor(x, y, ux, uy, vx, vy, command) {

    this.x = x || 0;
    this.y = y || 0;

    this._broadcast = _.bind(function() {
      this.trigger(EventTypes.change);
    }, this);

    this._command = command || Commands.move;
    this._relative = true;

    if (!command) {
      return this;
    }

    Anchor.AppendCurveProperties(this);

    if (is.Number(ux)) {
      this.controls.left.x = ux;
    }
    if (is.Number(uy)) {
      this.controls.left.y = uy;
    }
    if (is.Number(vx)) {
      this.controls.right.x = vx;
    }
    if (is.Number(vy)) {
      this.controls.right.y = vy;
    }

  }

 } 
  
Anchor.AppendCurveProperties = (anchor) => {
  anchor.controls = {
    left: new Vector(0, 0),
    right: new Vector(0, 0)
  };
}

  var AnchorProto = {

    listen: function() {

      if (!is.Object(this.controls)) {
        Anchor.AppendCurveProperties(this);
      }

      this.controls.left.on(EventTypes.change, this._broadcast);
      this.controls.right.on(EventTypes.change, this._broadcast);

      return this;

    },

    ignore: function() {

      this.controls.left.off(EventTypes.change, this._broadcast);
      this.controls.right.off(EventTypes.change, this._broadcast);

      return this;

    },

    clone: function() {

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

    },

    toObject: function() {
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

    // TODO: Make `Anchor.toString`

  };

  Object.defineProperty(Anchor.prototype, 'command', {

    enumerable: true,

    get: function() {
      return this._command;
    },

    set: function(c) {
      this._command = c;
      if (this._command === Commands.curve && !is.Object(this.controls)) {
        Anchor.AppendCurveProperties(this);
      }
      return this.trigger(EventTypes.change);
    }

  });

  Object.defineProperty(Anchor.prototype, 'relative', {

    enumerable: true,

    get: function() {
      return this._relative;
    },

    set: function(b) {
      if (this._relative == b) {
        return this;
      }
      this._relative = !!b;
      return this.trigger(EventTypes.change);
    }

  });

  _.extend(Anchor.prototype, Vector.prototype, AnchorProto);

  // Make it possible to bind and still have the Anchor specific
  // inheritance from Vector
  Anchor.prototype.on = function() {
    Vector.prototype.on.apply(this, arguments);
    _.extend(this, AnchorProto);
  };

  Anchor.prototype.off = function() {
    Vector.prototype.off.apply(this, arguments);
    _.extend(this, AnchorProto);
  };

export default Anchor;
