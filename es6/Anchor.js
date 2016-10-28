import _  from './utils/underscore';
import Commands  from './constants/CommandTypes';
import EventTypes   from './constants/EventTypes';
import Vector  from './Vector';

  /**
   * An object that holds 3 `Vector`s, the anchor point and its
   * corresponding handles: `left` and `right`.
   */
  var Anchor = function(x, y, ux, uy, vx, vy, command) {

    Vector.call(this, x, y);

    this._broadcast = _.bind(function() {
      this.trigger(EventTypes.change);
    }, this);

    this._command = command || Commands.move;
    this._relative = true;

    if (!command) {
      return this;
    }

    Anchor.AppendCurveProperties(this);

    if (_.isNumber(ux)) {
      this.controls.left.x = ux;
    }
    if (_.isNumber(uy)) {
      this.controls.left.y = uy;
    }
    if (_.isNumber(vx)) {
      this.controls.right.x = vx;
    }
    if (_.isNumber(vy)) {
      this.controls.right.y = vy;
    }

  };

  _.extend(Anchor, {

    AppendCurveProperties: function(anchor) {
      anchor.controls = {
        left: new Vector(0, 0),
        right: new Vector(0, 0)
      };
    }

  });

  var AnchorProto = {

    listen: function() {

      if (!_.isObject(this.controls)) {
        Anchor.AppendCurveProperties(this);
      }

      this.controls.left.bind(EventTypes.change, this._broadcast);
      this.controls.right.bind(EventTypes.change, this._broadcast);

      return this;

    },

    ignore: function() {

      this.controls.left.unbind(EventTypes.change, this._broadcast);
      this.controls.right.unbind(EventTypes.change, this._broadcast);

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
      if (this._command === Commands.curve && !_.isObject(this.controls)) {
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
  Anchor.prototype.bind = Anchor.prototype.on = function() {
    Vector.prototype.bind.apply(this, arguments);
    _.extend(this, AnchorProto);
  };

  Anchor.prototype.unbind = Anchor.prototype.off = function() {
    Vector.prototype.unbind.apply(this, arguments);
    _.extend(this, AnchorProto);
  };

export default Anchor;
