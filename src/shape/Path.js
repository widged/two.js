'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilUtils = require('../util/utils');

var _utilUtils2 = _interopRequireDefault(_utilUtils);

var _utilCollection = require('../util/Collection');

var _utilCollection2 = _interopRequireDefault(_utilCollection);

var _constantEventTypes = require('../constant/EventTypes');

var _constantEventTypes2 = _interopRequireDefault(_constantEventTypes);

var _constantCommandTypes = require('../constant/CommandTypes');

var _constantCommandTypes2 = _interopRequireDefault(_constantCommandTypes);

var _Shape = require('./Shape');

var _Shape2 = _interopRequireDefault(_Shape);

var _Vector = require('../Vector');

var _Vector2 = _interopRequireDefault(_Vector);

var _Anchor = require('../Anchor');

var _Anchor2 = _interopRequireDefault(_Anchor);

/**
 * Constants
 */

var min = Math.min,
    max = Math.max,
    round = Math.round,
    getComputedMatrix = _utilUtils2['default'].getComputedMatrix;

var commands = {};

_utilUtils2['default'].each(_constantCommandTypes2['default'], function (v, k) {
  commands[k] = new RegExp(v);
});

var Path = function Path(vertices, closed, curved, manual) {

  _Shape2['default'].call(this);

  this._renderer.type = 'path';

  this._closed = !!closed;
  this._curved = !!curved;

  this.beginning = 0;
  this.ending = 1;

  // Style properties

  this.fill = '#fff';
  this.stroke = '#000';
  this.linewidth = 1.0;
  this.opacity = 1.0;
  this.visible = true;

  this.cap = 'butt'; // Default of Adobe Illustrator
  this.join = 'miter'; // Default of Adobe Illustrator
  this.miter = 4; // Default of Adobe Illustrator

  this._vertices = [];
  this.vertices = vertices;

  // Determines whether or not two.js should calculate curves, lines, and
  // commands automatically for you or to let the developer manipulate them
  // for themselves.
  this.automatic = !manual;
};

_utilUtils2['default'].extend(Path, {

  Properties: ['fill', 'stroke', 'linewidth', 'opacity', 'visible', 'cap', 'join', 'miter', 'closed', 'curved', 'automatic', 'beginning', 'ending'],

  FlagVertices: function FlagVertices() {
    this._flagVertices = true;
    this._flagLength = true;
  },

  MakeObservable: function MakeObservable(object) {

    _Shape2['default'].MakeObservable(object);

    // Only the first 8 properties are flagged like this. The subsequent
    // properties behave differently and need to be hand written.
    _utilUtils2['default'].each(Path.Properties.slice(0, 8), _utilUtils2['default'].defineProperty, object);

    Object.defineProperty(object, 'length', {
      get: function get() {
        if (this._flagLength) {
          this._updateLength();
        }
        return this._length;
      }
    });

    Object.defineProperty(object, 'closed', {
      enumerable: true,
      get: function get() {
        return this._closed;
      },
      set: function set(v) {
        this._closed = !!v;
        this._flagVertices = true;
      }
    });

    Object.defineProperty(object, 'curved', {
      enumerable: true,
      get: function get() {
        return this._curved;
      },
      set: function set(v) {
        this._curved = !!v;
        this._flagVertices = true;
      }
    });

    Object.defineProperty(object, 'automatic', {
      enumerable: true,
      get: function get() {
        return this._automatic;
      },
      set: function set(v) {
        if (v === this._automatic) {
          return;
        }
        this._automatic = !!v;
        var method = this._automatic ? 'ignore' : 'listen';
        _utilUtils2['default'].each(this.vertices, function (v) {
          v[method]();
        });
      }
    });

    Object.defineProperty(object, 'beginning', {
      enumerable: true,
      get: function get() {
        return this._beginning;
      },
      set: function set(v) {
        this._beginning = min(max(v, 0.0), this._ending);
        this._flagVertices = true;
      }
    });

    Object.defineProperty(object, 'ending', {
      enumerable: true,
      get: function get() {
        return this._ending;
      },
      set: function set(v) {
        this._ending = min(max(v, this._beginning), 1.0);
        this._flagVertices = true;
      }
    });

    Object.defineProperty(object, 'vertices', {

      enumerable: true,

      get: function get() {
        return this._collection;
      },

      set: function set(vertices) {

        var updateVertices = _utilUtils2['default'].bind(Path.FlagVertices, this);

        var bindVerts = _utilUtils2['default'].bind(function (items) {

          // This function is called a lot
          // when importing a large SVG
          var i = items.length;
          while (i--) {
            items[i].bind(_constantEventTypes2['default'].change, updateVertices);
          }

          updateVertices();
        }, this);

        var unbindVerts = _utilUtils2['default'].bind(function (items) {

          _utilUtils2['default'].each(items, function (v) {
            v.unbind(_constantEventTypes2['default'].change, updateVertices);
          }, this);

          updateVertices();
        }, this);

        // Remove previous listeners
        if (this._collection) {
          this._collection.unbind();
        }

        // Create new Collection with copy of vertices
        this._collection = new _utilCollection2['default']((vertices || []).slice(0));

        // Listen for Collection changes and bind / unbind
        this._collection.bind(_constantEventTypes2['default'].insert, bindVerts);
        this._collection.bind(_constantEventTypes2['default'].remove, unbindVerts);

        // Bind Initial Vertices
        bindVerts(this._collection);
      }

    });

    Object.defineProperty(object, 'clip', {
      enumerable: true,
      get: function get() {
        return this._clip;
      },
      set: function set(v) {
        this._clip = v;
        this._flagClip = true;
      }
    });
  }

});

_utilUtils2['default'].extend(Path.prototype, _Shape2['default'].prototype, {

  // Flags
  // http://en.wikipedia.org/wiki/Flag

  _flagVertices: true,
  _flagLength: true,

  _flagFill: true,
  _flagStroke: true,
  _flagLinewidth: true,
  _flagOpacity: true,
  _flagVisible: true,

  _flagCap: true,
  _flagJoin: true,
  _flagMiter: true,

  _flagClip: false,

  // Underlying Properties

  _length: 0,

  _fill: '#fff',
  _stroke: '#000',
  _linewidth: 1.0,
  _opacity: 1.0,
  _visible: true,

  _cap: 'round',
  _join: 'round',
  _miter: 4,

  _closed: true,
  _curved: false,
  _automatic: true,
  _beginning: 0,
  _ending: 1.0,

  _clip: false,

  clone: function clone(parent) {

    parent = parent || this.parent;

    var points = _utilUtils2['default'].map(this.vertices, function (v) {
      return v.clone();
    });

    var clone = new Path(points, this.closed, this.curved, !this.automatic);

    _utilUtils2['default'].each(Path.Properties, function (k) {
      clone[k] = this[k];
    }, this);

    clone.translation.copy(this.translation);
    clone.rotation = this.rotation;
    clone.scale = this.scale;

    parent.add(clone);

    return clone;
  },

  toObject: function toObject() {

    var result = {
      vertices: _utilUtils2['default'].map(this.vertices, function (v) {
        return v.toObject();
      })
    };

    _utilUtils2['default'].each(_Shape2['default'].Properties, function (k) {
      result[k] = this[k];
    }, this);

    result.translation = this.translation.toObject;
    result.rotation = this.rotation;
    result.scale = this.scale;

    return result;
  },

  noFill: function noFill() {
    this.fill = 'transparent';
    return this;
  },

  noStroke: function noStroke() {
    this.stroke = 'transparent';
    return this;
  },

  /**
   * Orient the vertices of the shape to the upper lefthand
   * corner of the path.
   */
  corner: function corner() {

    var rect = this.getBoundingClientRect(true);

    rect.centroid = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    _utilUtils2['default'].each(this.vertices, function (v) {
      v.addSelf(rect.centroid);
    });

    return this;
  },

  /**
   * Orient the vertices of the shape to the center of the
   * path.
   */
  center: function center() {

    var rect = this.getBoundingClientRect(true);

    rect.centroid = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    _utilUtils2['default'].each(this.vertices, function (v) {
      v.subSelf(rect.centroid);
    });

    // this.translation.addSelf(rect.centroid);

    return this;
  },

  /**
   * Remove self from the scene / parent.
   */
  remove: function remove() {

    if (!this.parent) {
      return this;
    }

    this.parent.remove(this);

    return this;
  },

  /**
   * Return an object with top, left, right, bottom, width, and height
   * parameters of the group.
   */
  getBoundingClientRect: function getBoundingClientRect(shallow) {
    var matrix, border, l, x, y, i, v;

    var left = Infinity,
        right = -Infinity,
        top = Infinity,
        bottom = -Infinity;

    // TODO: Update this to not __always__ update. Just when it needs to.
    this._update(true);

    matrix = !!shallow ? this._matrix : getComputedMatrix(this);

    border = this.linewidth / 2;
    l = this._vertices.length;

    if (l <= 0) {
      v = matrix.multiply(0, 0, 1);
      return {
        top: v.y,
        left: v.x,
        right: v.x,
        bottom: v.y,
        width: 0,
        height: 0
      };
    }

    for (i = 0; i < l; i++) {
      v = this._vertices[i];

      x = v.x;
      y = v.y;

      v = matrix.multiply(x, y, 1);
      top = min(v.y - border, top);
      left = min(v.x - border, left);
      right = max(v.x + border, right);
      bottom = max(v.y + border, bottom);
    }

    return {
      top: top,
      left: left,
      right: right,
      bottom: bottom,
      width: right - left,
      height: bottom - top
    };
  },

  /**
   * Given a float `t` from 0 to 1, return a point or assign a passed `obj`'s
   * coordinates to that percentage on this Path's curve.
   */
  getPointAt: function getPointAt(t, obj) {
    var x, x1, x2, x3, x4, y, y1, y2, y3, y4, left, right;
    var target = this.length * Math.min(Math.max(t, 0), 1);
    var length = this.vertices.length;
    var last = length - 1;

    var a = null;
    var b = null;

    for (var i = 0, l = this._lengths.length, sum = 0; i < l; i++) {

      if (sum + this._lengths[i] > target) {
        a = this.vertices[this.closed ? _utilUtils2['default'].mod(i, length) : i];
        b = this.vertices[Math.min(Math.max(i - 1, 0), last)];
        target -= sum;
        t = target / this._lengths[i];
        break;
      }

      sum += this._lengths[i];
    }

    if (_utilUtils2['default'].isNull(a) || _utilUtils2['default'].isNull(b)) {
      return null;
    }

    right = b.controls && b.controls.right;
    left = a.controls && a.controls.left;

    x1 = b.x;
    y1 = b.y;
    x2 = (right || b).x;
    y2 = (right || b).y;
    x3 = (left || a).x;
    y3 = (left || a).y;
    x4 = a.x;
    y4 = a.y;

    if (right && b._relative) {
      x2 += b.x;
      y2 += b.y;
    }

    if (left && a._relative) {
      x3 += a.x;
      y3 += a.y;
    }

    x = _utilUtils2['default'].getPointOnCubicBezier(t, x1, x2, x3, x4);
    y = _utilUtils2['default'].getPointOnCubicBezier(t, y1, y2, y3, y4);

    if (_utilUtils2['default'].isObject(obj)) {
      obj.x = x;
      obj.y = y;
      return obj;
    }

    return new _Vector2['default'](x, y);
  },

  /**
   * Based on closed / curved and sorting of vertices plot where all points
   * should be and where the respective handles should be too.
   */
  plot: function plot() {

    if (this.curved) {
      _utilUtils2['default'].getCurveFromPoints(this._vertices, this.closed);
      return this;
    }

    for (var i = 0; i < this._vertices.length; i++) {
      this._vertices[i]._command = i === 0 ? _constantCommandTypes2['default'].move : _constantCommandTypes2['default'].line;
    }

    return this;
  },

  subdivide: function subdivide(limit) {
    //TODO: DRYness (function below)
    this._update();

    var last = this.vertices.length - 1;
    var b = this.vertices[last];
    var closed = this._closed || this.vertices[last]._command === _constantCommandTypes2['default'].close;
    var points = [];
    _utilUtils2['default'].each(this.vertices, function (a, i) {

      if (i <= 0 && !closed) {
        b = a;
        return;
      }

      if (a.command === _constantCommandTypes2['default'].move) {
        points.push(new _Anchor2['default'](b.x, b.y));
        if (i > 0) {
          points[points.length - 1].command = _constantCommandTypes2['default'].line;
        }
        b = a;
        return;
      }

      var verts = getSubdivisions(a, b, limit);
      points = points.concat(verts);

      // Assign commands to all the verts
      _utilUtils2['default'].each(verts, function (v, i) {
        if (i <= 0 && b.command === _constantCommandTypes2['default'].move) {
          v.command = _constantCommandTypes2['default'].move;
        } else {
          v.command = _constantCommandTypes2['default'].line;
        }
      });

      if (i >= last) {

        // TODO: Add check if the two vectors in question are the same values.
        if (this._closed && this._automatic) {

          b = a;

          verts = getSubdivisions(a, b, limit);
          points = points.concat(verts);

          // Assign commands to all the verts
          _utilUtils2['default'].each(verts, function (v, i) {
            if (i <= 0 && b.command === _constantCommandTypes2['default'].move) {
              v.command = _constantCommandTypes2['default'].move;
            } else {
              v.command = _constantCommandTypes2['default'].line;
            }
          });
        } else if (closed) {
          points.push(new _Anchor2['default'](a.x, a.y));
        }

        points[points.length - 1].command = closed ? _constantCommandTypes2['default'].close : _constantCommandTypes2['default'].line;
      }

      b = a;
    }, this);

    this._automatic = false;
    this._curved = false;
    this.vertices = points;

    return this;
  },

  _updateLength: function _updateLength(limit) {
    //TODO: DRYness (function above)
    this._update();

    var last = this.vertices.length - 1;
    var b = this.vertices[last];
    var closed = this._closed || this.vertices[last]._command === _constantCommandTypes2['default'].close;
    var sum = 0;

    if (_utilUtils2['default'].isUndefined(this._lengths)) {
      this._lengths = [];
    }

    _utilUtils2['default'].each(this.vertices, function (a, i) {

      if (i <= 0 && !closed || a.command === _constantCommandTypes2['default'].move) {
        b = a;
        this._lengths[i] = 0;
        return;
      }

      this._lengths[i] = getCurveLength(a, b, limit);
      sum += this._lengths[i];

      if (i >= last && closed) {

        b = a;

        this._lengths[i + 1] = getCurveLength(a, b, limit);
        sum += this._lengths[i + 1];
      }

      b = a;
    }, this);

    this._length = sum;

    return this;
  },

  _update: function _update() {

    if (this._flagVertices) {

      var l = this.vertices.length;
      var last = l - 1,
          v;

      var ia = round(this._beginning * last);
      var ib = round(this._ending * last);

      this._vertices.length = 0;

      for (var i = ia; i < ib + 1; i++) {
        v = this.vertices[i];
        this._vertices.push(v);
      }

      if (this._automatic) {
        this.plot();
      }
    }

    _Shape2['default'].prototype._update.apply(this, arguments);

    return this;
  },

  flagReset: function flagReset() {

    this._flagVertices = this._flagFill = this._flagStroke = this._flagLinewidth = this._flagOpacity = this._flagVisible = this._flagCap = this._flagJoin = this._flagMiter = this._flagClip = false;

    _Shape2['default'].prototype.flagReset.call(this);

    return this;
  }

});

Path.MakeObservable(Path.prototype);

/**
 * Utility functions
 */

function getCurveLength(a, b, limit) {
  // TODO: DRYness
  var x1, x2, x3, x4, y1, y2, y3, y4;

  var right = b.controls && b.controls.right;
  var left = a.controls && a.controls.left;

  x1 = b.x;
  y1 = b.y;
  x2 = (right || b).x;
  y2 = (right || b).y;
  x3 = (left || a).x;
  y3 = (left || a).y;
  x4 = a.x;
  y4 = a.y;

  if (right && b._relative) {
    x2 += b.x;
    y2 += b.y;
  }

  if (left && a._relative) {
    x3 += a.x;
    y3 += a.y;
  }

  return _utilUtils2['default'].getCurveLength(x1, y1, x2, y2, x3, y3, x4, y4, limit);
}

function getSubdivisions(a, b, limit) {
  // TODO: DRYness
  var x1, x2, x3, x4, y1, y2, y3, y4;

  var right = b.controls && b.controls.right;
  var left = a.controls && a.controls.left;

  x1 = b.x;
  y1 = b.y;
  x2 = (right || b).x;
  y2 = (right || b).y;
  x3 = (left || a).x;
  y3 = (left || a).y;
  x4 = a.x;
  y4 = a.y;

  if (right && b._relative) {
    x2 += b.x;
    y2 += b.y;
  }

  if (left && a._relative) {
    x3 += a.x;
    y3 += a.y;
  }

  return _utilUtils2['default'].subdivide(x1, y1, x2, y2, x3, y3, x4, y4, limit);
}

exports['default'] = Path;
module.exports = exports['default'];