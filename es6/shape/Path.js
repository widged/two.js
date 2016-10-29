import EventTypes   from '../constant/EventTypes';
import Commands from '../constant/CommandTypes';
import _  from '../util/common';
import is  from '../util/is';
import Collection  from '../struct/Collection';
import Vector from '../struct/Vector';
import curveFN  from '../util/curve-manipulation';
import Anchor from '../Anchor';
import Shape from './Shape';

var {isUndefined, isNull} = is;
var {copyKeys} = _;
var {getComputedMatrix, getCurveLengthAB, subdivideTo} = curveFN;
var {min, max, round} = Math;


const PROPS = [
  'fill',
  'stroke',
  'linewidth',
  'opacity',
  'visible',
  'cap',
  'join',
  'miter',

  'closed',
  'curved',
  'automatic',
  'beginning',
  'ending',

  'clip'
];

var FLAG_DEFAULTS = {
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

}

var PROP_DEFAULTS = {
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
}

class Path extends Shape {

  constructor(vertices, closed, curved, manual) {
    super();

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

    this.cap = 'butt';      // Default of Adobe Illustrator
    this.join = 'miter';    // Default of Adobe Illustrator
    this.miter = 4;         // Default of Adobe Illustrator

    this._vertices = [];
    this.vertices = vertices;

    // Determines whether or not two.js should calculate curves, lines, and
    // commands automatically for you or to let the developer manipulate them
    // for themselves.
    this.automatic = !manual;

  }

  get length() {
    if (this._flagLength) {
      this._updateLength();
    }
    return this._length;
  }

  get closed() {
    return this._closed;
  }
  set closed(v) {
    this._closed = !!v;
    this._flagVertices = true;
  }

  get curved() {
    return this._curved;
  }
  set curved(v) {
    this._curved = !!v;
    this._flagVertices = true;
  }

  get automatic() {
    return this._automatic;
  }
  set automatic(v) {
    if (v === this._automatic) {
      return;
    }
    this._automatic = !!v;
    var method = this._automatic ? 'ignore' : 'listen';
    _.each(this.vertices, function(v) {
      v[method]();
    });
  }

  get beginning() {
    return this._beginning;
  }
  set beginning(v) {
    this._beginning = min(max(v, 0.0), this._ending);
    this._flagVertices = true;
  }

  get ending() {
    return this._ending;
  }
  set ending(v) {
    this._ending = min(max(v, this._beginning), 1.0);
    this._flagVertices = true;
  }


  get vertices() {
    return this._collection;
  }
  set vertices(vertices) {

    var updateVertices = () => {
        this._flagVertices = true;
        this._flagLength = true;
    };

    var bindVerts = _.bind(function(items) {

      // This function is called a lot
      // when importing a large SVG
      var i = items.length;
      while(i--) {
        items[i].on(EventTypes.change, updateVertices);
      }

      updateVertices();

    }, this);

    var unbindVerts = _.bind(function(items) {

      _.each(items, function(v) {
        v.off(EventTypes.change, updateVertices);
      }, this);

      updateVertices();

    }, this);

    // Remove previous listeners
    if (this._collection) {
      this._collection.off();
    }

    // Create new Collection with copy of vertices
    this._collection = new Collection((vertices || []).slice(0));

    // Listen for Collection changes and bind / unbind
    this._collection.on(EventTypes.insert, bindVerts);
    this._collection.on(EventTypes.remove, unbindVerts);

    // Bind Initial Vertices
    bindVerts(this._collection);

  }


  get clip() {
    return this._clip;
  }
  set clip(v) {
    this._clip = v;
    this._flagClip = true;
  }  

clone(parent) {

      parent = parent || this.parent;

      var points = _.map(this.vertices, function(v) {
        return v.clone();
      });

      var clone = new Path(points, this.closed, this.curved, !this.automatic);
      copyKeys(Path.Properties, this, clone);

      clone.translation.copy(this.translation);
      clone.rotation = this.rotation;
      clone.scale = this.scale;

      parent.add(clone);

      return clone;

    }

    toObject() {

      var result = {
        vertices: _.map(this.vertices, function(v) {
          return v.toObject();
        })
      };
      copyKeys(Shape.Properties, this, result);

      result.translation = this.translation.toObject;
      result.rotation = this.rotation;
      result.scale = this.scale;

      return result;

    }

    noFill() {
      this.fill = 'transparent';
      return this;
    }

    noStroke() {
      this.stroke = 'transparent';
      return this;
    }

    /**
     * Orient the vertices of the shape to the upper lefthand
     * corner of the path.
     */
    corner() {

      var rect = this.getBoundingClientRect(true);

      rect.centroid = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };

      _.each(this.vertices, function(v) {
        v.addSelf(rect.centroid);
      });

      return this;

    }

    /**
     * Orient the vertices of the shape to the center of the
     * path.
     */
    center() {

      var rect = this.getBoundingClientRect(true);

      rect.centroid = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };

      _.each(this.vertices, function(v) {
        v.subSelf(rect.centroid);
      });

      // this.translation.addSelf(rect.centroid);

      return this;

    }

    /**
     * Remove self from the scene / parent.
     */
    remove() {

      if (!this.parent) {
        return this;
      }

      this.parent.remove(this);

      return this;

    }

    /**
     * Return an object with top, left, right, bottom, width, and height
     * parameters of the group.
     */
    getBoundingClientRect(shallow) {
      var matrix, border, l, x, y, i, v;

      var left = Infinity, right = -Infinity,
          top = Infinity, bottom = -Infinity;

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

    }

    
    /**
     * Based on closed / curved and sorting of vertices plot where all points
     * should be and where the respective handles should be too.
     */
    plot() {

      if (this.curved) {
        _.getCurveFromPoints(this._vertices, this.closed);
        return this;
      }

      for (var i = 0; i < this._vertices.length; i++) {
        this._vertices[i]._command = i === 0 ? Commands.move : Commands.line;
      }

      return this;

    }

    subdivide(limit) {
      //TODO: DRYness (function below)
      this._update();

      subdivideTo(limit, pth);

      this._automatic = false;
      this._curved = false;
      this.vertices = points;

      return this;

    }

    _updateLength(limit) {
      //TODO: DRYness (function above)
      this._update();

      var last = this.vertices.length - 1;
      var b = this.vertices[last];
      var closed = this._closed || this.vertices[last]._command === Commands.close;
      var sum = 0;

      if (isUndefined(this._lengths)) {
        this._lengths = [];
      }

      _.each(this.vertices, function(a, i) {

        if ((i <= 0 && !closed) || a.command === Commands.move) {
          b = a;
          this._lengths[i] = 0;
          return;
        }

        this._lengths[i] = getCurveLengthAB(a, b, limit);
        sum += this._lengths[i];

        if (i >= last && closed) {

          b = a;

          this._lengths[i + 1] = getCurveLengthAB(a, b, limit);
          sum += this._lengths[i + 1];

        }

        b = a;

      }, this);

      this._length = sum;

      return this;

    }

    _update() {

      if (this._flagVertices) {

        var l = this.vertices.length;
        var last = l - 1, v;

        var ia = round((this._beginning) * last);
        var ib = round((this._ending) * last);

        this._vertices.length = 0;

        for (var i = ia; i < ib + 1; i++) {
          v = this.vertices[i];
          this._vertices.push(v);
        }

        if (this._automatic) {
          this.plot();
        }

      }

      Shape.prototype._update.apply(this, arguments);

      return this;

    }

    flagReset() {

      this._flagVertices =  this._flagFill =  this._flagStroke =
         this._flagLinewidth = this._flagOpacity = this._flagVisible =
         this._flagCap = this._flagJoin = this._flagMiter =
         this._flagClip = false;

      Shape.prototype.flagReset.call(this);

      return this;

    }  
}
Path.Properties = PROPS;

Object.defineProperty(Path.prototype, 'closed', {enumerable: true});
Object.defineProperty(Path.prototype, 'curved', {enumerable: true});
Object.defineProperty(Path.prototype, 'automatic', {enumerable: true});
Object.defineProperty(Path.prototype, 'beginning', {enumerable: true});
Object.defineProperty(Path.prototype, 'ending', {enumerable: true});
Object.defineProperty(Path.prototype, 'vertices', {enumerable: true});
Object.defineProperty(Path.prototype, 'clip', {enumerable: true});

_.defineFlaggedAccessors(Path.prototype, Path.Properties.slice(0, 8));

Object.assign(Path.prototype, FLAG_DEFAULTS);
Object.assign(Path.prototype, PROP_DEFAULTS);

export default Path;

