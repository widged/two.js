/* jshint esnext: true */

import DefaultValues from '../constant/DefaultValues';
import CollectionEvent   from '../constant/CollectionEvent';
import VectorEvent   from '../constant/VectorEvent';
import Commands from '../constant/CommandTypes';
import _  from '../util/common';
import is  from '../util/is';
import Collection  from '../struct/Collection';

import Anchor  from '../Anchor';
import Shape   from '../Shape';
import shapeFN from '../shape-fn';
import pathFN  from './path-fn';

var {isUndefined, isNull} = is;
var {arrayLast} = _;
var {getComputedMatrix, getCurveLengthAB, subdivideTo, updateLength, copyVertices} = pathFN;
var {min, max, round} = Math;
var {cloneProperties, serializeProperties, getPathBoundingRect, defineSecretAccessors} = shapeFN;

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
 */

class Path extends Shape {


  constructor(vertices, closed, curved, manual) {
    super();

    /*
     id - The id of the path. In the svg renderer this is the same number as the id attribute given to the corresponding node. i.e: if path.id = 4 then document.querySelector('#two-' + group.id) will return the corresponding svg node.
     parent  - A reference to the `Group` that contains this instance.
     vertices - A `Collection` of `Anchors` that is two-way databound. Individual vertices may be manipulated.
     */
    this._renderer.type = 'path';

    this._closed = !!closed;
    this._curved = !!curved;

    this.beginning = 0;
    this.ending = 1;

    // Style properties
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

  /**
   * Removes the fill.
   */
  noFill() {
    this.fill = 'transparent';
    return this;
  }

  /**
   * Removes the stroke.
   */
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
   * If added to a `scene`, removes itself from it.
   */
  remove() {

    if (!this.parent) {
      return this;
    }

    this.parent.remove(this);

    return this;

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

  /**
   * Creates a new set of vertices that are lineTo anchors. For previously straight lines the anchors remain the same. For curved lines, however, Two.Utils.subdivide is used to generate a new set of straight lines that are perceived as a curve.
   */
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

  // -----------------
  // IBounded
  // -----------------

  /**
   * Return an object with top, left, right, bottom, width, and height
   * parameters of the path. Pass true if you're interested in the shallow
   * positioning, i.e in the space directly affecting the object and not where it is nested.
   */
  getBoundingClientRect(shallow) {
    // TODO: Update this to not __always__ update. Just when it needs to.
    this._update(true);
    var matrix = !!shallow ? this._matrix : getComputedMatrix(this);
    var border = this.linewidth / 2;
    var length = this._vertices.length;
    var vertices = this._vertices;
    return getPathBoundingRect(matrix, border, length, vertices);
  }

  // -----------------
  // IRenderable
  // -----------------

  flagReset() {

    this._flag_vertices =  this._flag_fill =  this._flag_stroke =
       this._flag_linewidth = this._flag_opacity = this._flag_visible =
       this._flag_cap = this._flag_join = this._flag_miter =
       this._flag_clip = false;

    Shape.prototype.flagReset.call(this);

    return this;

  }

  /**
   * Returns a new instance of a `Path` with the same settings.
   */
  clone(parent) {
    parent = parent || this.parent;
    var points = this.vertices.map((d) => { return d.clone(); });
    var clone = cloneProperties(
      this,
      new Path(points, this.closed, this.curved, !this.automatic),
      Path.Properties
    );
    parent.add(clone);
    return clone;
  }

  toObject() {
    var obj = serializeProperties(this, {}, []);
    obj.vertices = this.vertices.map((d) => { return d.clone(); });
    return obj;
  }
}


Path.Properties = Object.keys(DefaultValues.Path);

// unraisedFlag: clip
// don't require???
defineSecretAccessors({
  proto: Path.prototype,
  accessors: Path.Properties.filter((d) => { return true || !'length,closed,curved,automatic,beginning,ending,clip'.includes(d); }),
  raisedFlags: ['vertices,length'],
  secrets: Path.Properties
});

// direct, not secreted
Path.Properties.forEach((k) => { Path.prototype[k] = DefaultValues.Path[k]; });

export default Path;
