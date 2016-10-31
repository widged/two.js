/* jshint esnext: true */

import CollectionEvent   from '../constant/CollectionEvent';
import VectorEvent   from '../constant/VectorEvent';
import Commands from '../constant/CommandTypes';
import _  from '../util/common';
import is  from '../util/is';
import Collection  from '../struct/Collection';
import Vector from '../struct/Vector';
import Anchor from '../Anchor';
import Shape from '../Shape';
import shapeFN    from '../shape-fn';
import pathFN  from './path-fn';
import DefaultValues from '../constant/DefaultValues';

var {isUndefined, isNull} = is;
var {arrayLast} = _;
var {getComputedMatrix, getCurveLengthAB, subdivideTo, updateLength, copyVertices} = pathFN;
var {min, max, round} = Math;

// Underlying Properties
var pathDefaults = DefaultValues.Path;

var config = {
  flags : {
    flag_vertices: true,
    flag_length: true,
    flag_clip: false,
  },

  props : {
      length: 0,
      closed: true,
      curved: false,
      automatic: true,
      beginning: 0,
      ending: 1.0,
      clip: false,
  }
};

/**
 * This is the base class for creating all drawable shapes in two.js. By default,
 * methods return their instance of Path for the purpose of chaining.
 *
 * A path takes an array of vertices which are made up of Two.Anchors. This is
 * essential for the two-way databinding. It then takes two booleans, closed and
 * curved which delineate whether the shape should be closed (lacking endpoints)
 * and whether the shape should calculate curves or straight lines between the
 * vertices. Finally, manual is an optional argument if you'd like to override
 * the default behavior of two.js and handle anchor positions yourself. Generally
 * speaking, this isn't something you need to deal with, although some great
 * usecases arise from this customability, e.g: advanced curve manipulation.
 *
 * NB. If you are constructing groups this way instead of two.makePath(), then
 * don't forget to add the group to the instance's scene, two.add(group).
 *
 */
 /*

id path.id
The id of the path. In the svg renderer this is the same number as the id attribute given to the corresponding node. i.e: if path.id = 4 then document.querySelector('#two-' + group.id) will return the corresponding svg node.

parent path.parent
A reference to the Two.Group that contains this instance.

vertices path.vertices
A Two.Utils.Collection of Two.Anchors that is two-way databound. Individual vertices may be manipulated.

closed path.closed
Boolean that describes whether the path is closed or not.

curved path.curved
Boolean that describes whether the path is curved or not.

automatic path.automatic
Boolean that describes whether the path should automatically dictate how Two.Anchors behave. This defaults to true.

beginning path.beginning
A number, 0-1, that is mapped to the layout and order of vertices. It represents which of the vertices from beginning to end should start the shape. Exceedingly helpful for animating strokes. Defaults to 0.

ending path.ending
A number, 0-1, that is mapped to the layout and order of vertices. It represents which of the vertices from beginning to end should end the shape. Exceedingly helpful for animating strokes. Defaults to 1.

clone path.clone();
Returns a new instance of a Two.Path with the same settings.

center path.center();
Anchors all vertices around the centroid of the group.

addTo path.addTo(group);
Adds the instance to a Two.Group.

remove path.remove();
If added to a two.scene this method removes itself from it.

getBoundingClientRect path.getBoundingClientRect(shallow);
Returns an object with top, left, right, bottom, width, and height parameters representing the bounding box of the path. Pass true if you're interested in the shallow positioning, i.e in the space directly affecting the object and not where it is nested.

noFill path.noFill();
Removes the fill.

noStroke path.noStroke();
Removes the stroke.

plot path.plot();
If curved goes through the vertices and calculates the curve. If not, then goes through the vertices and calculates the lines.

subdivide path.subdivide();
Creates a new set of vertices that are lineTo anchors. For previously straight lines the anchors remain the same. For curved lines, however, Two.Utils.subdivide is used to generate a new set of straight lines that are perceived as a curve.
*/
class Path extends Shape {

  // --------------------
  // Constructor
  // --------------------

  constructor(vertices, closed, curved, manual) {
    super();

    this._renderer.type = 'path';

    this._closed = !!closed;
    this._curved = !!curved;

    this.beginning = 0;
    this.ending = 1;

    // Style properties
    Object.keys(pathDefaults).forEach((k) => { this[k] = pathDefaults[k]; });
    this.cap = 'butt';      // Default of Adobe Illustrator
    this.join = 'miter';    // Default of Adobe Illustrator

    this._vertices = [];
    this.vertices = vertices;

    // Determines whether or not two.js should calculate curves, lines, and
    // commands automatically for you or to let the developer manipulate them
    // for themselves.
    this.automatic = !manual;

  }

  // --------------------
  // Accessors
  // --------------------

  get length() {
    if (this._flag_length) {
      this._updateLength();
    }
    return this._length;
  }

  get closed() {
    return this._closed;
  }
  set closed(v) {
    this._closed = !!v;
    this._flag_vertices = true;
  }

  get curved() {
    return this._curved;
  }
  set curved(v) {
    this._curved = !!v;
    this._flag_vertices = true;
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
    this._flag_vertices = true;
  }

  get ending() {
    return this._ending;
  }
  set ending(v) {
    this._ending = min(max(v, this._beginning), 1.0);
    this._flag_vertices = true;
  }


  get vertices() {
    return this._collection;
  }
  set vertices(vertices) {

    var copyVertices = () => {
        this._flag_vertices = true;
        this._flag_length = true;
    };

    var bindVerts = _.bind(function(items) {

      // This function is called a lot
      // when importing a large SVG
      var i = items.length;
      while(i--) {
        items[i].dispatcher.on(VectorEvent.change, copyVertices);
      }
      copyVertices();
    }, this);

    var unbindVerts = _.bind(function(items) {
      var i = items.length;
      while(i--) {
        items[i].dispatcher.off(VectorEvent.change, copyVertices);
      }
      copyVertices();
    }, this);

    // Remove previous listeners
    if (this._collection) {
      this._collection.dispatcher.off();
    }

    // Create new Collection with copy of vertices
    this._collection = new Collection((vertices || []).slice(0));

    // Listen for Collection changes and bind / unbind
    this._collection.dispatcher.on(CollectionEvent.insert, bindVerts);
    this._collection.dispatcher.on(CollectionEvent.remove, unbindVerts);

    // Bind Initial Vertices
    bindVerts(this._collection);

  }


  get clip() {
    return this._clip;
  }
  set clip(v) {
    this._clip = v;
    this._flag_clip = true;
  }

  // -----------------
  // Pseudo accessors
  // -----------------

  noFill() {
    this.fill = 'transparent';
    return this;
  }

  noStroke() {
    this.stroke = 'transparent';
    return this;
  }

  // -----------------
  // Main
  // -----------------

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
   * If curved goes through the vertices and calculates the curve.
   * If not, then goes through the vertices and calculates the lines.
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
    this._update();
    this._automatic = false;
    this._curved = false;
    this.vertices = subdivideTo({
      limit,
      vertices: this.vertices,
      pathClosed : this._closed,
      lastClosed : (arrayLast(this.vertices)._command === Commands.close) ? true : false,
      automatic: this._automatic
    });
    return this;
  }

  // -----------------
  // Private
  // -----------------

  _updateLength(limit) {
    this._update();
    var {lengths, sum} = updateLength({
      limit,
      vertices: this.vertices,
      pathClosed: this._closed,
      lastClosed: (arrayLast(this.vertices)._command === Commands.close) ? true : false,
      lengths: this._lengths
    });
    this._lengths = lengths;
    this._length = sum;

    return this;

  }

  _update() {

    if (this._flag_vertices) {
      this._vertices = copyVertices({
        vertices:  this.vertices,
        beginning: this._beginning,
        ending:    this._ending
      });
      if (this._automatic) { this.plot(); }
    }

    Shape.prototype._update.apply(this, arguments);

    return this;

  }

  flagReset() {

    this._flag_vertices =  this._flag_fill =  this._flag_stroke =
       this._flag_linewidth = this._flag_opacity = this._flag_visible =
       this._flag_cap = this._flag_join = this._flag_miter =
       this._flag_clip = false;

    Shape.prototype.flagReset.call(this);

    return this;

  }

  // -----------------
  // Utils
  // -----------------

  clone(parent) {
    parent = parent || this.parent;
    var points = this.vertices.map((d) => { return d.clone(); });
    var clone = shapeFN.clone(
      this,
      new Path(points, this.closed, this.curved, !this.automatic),
      Object.keys(config.props).concat( Object.keys(pathDefaults))
    );
    parent.add(clone);
    return clone;
  }

  toObject() {
    var obj = shapeFN.toObject(this, {}, []);
    obj.vertices = this.vertices.map((d) => { return d.clone(); });
    return obj;
  }
}


// flags
var asFlag = (txt) => { return '_flag_'+ txt; };
shapeFN.defineSecretAccessors({proto: Path.prototype,accessors: Object.keys(pathDefaults), flags: config.flags});
Object.keys(pathDefaults).forEach((k) => { Path.prototype[asFlag(k)] = true; });

// backup value
Object.keys(pathDefaults).forEach((k) => { Path.prototype['_'+k] = pathDefaults[k]; });
Object.keys(config.props ).forEach((k) => { Path.prototype['_'+k] = config.props[k]; });

export default Path;
