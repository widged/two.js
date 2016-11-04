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
import pathFN  from './fn-path';
import shapeRendering   from '../shape-rendering';

var {defineSecretAccessors} = shapeRendering;

var {isUndefined, isNull} = is;
var {arrayLast} = _;
var {getComputedMatrix, getCurveLengthAB, subdivideTo, updateLength, copyVertices, rectTopLeft, rectCentroid} = pathFN;
var {min, max, round} = Math;
var {cloneProperties, serializeProperties, getPathBoundingRect} = shapeFN;

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
    // let's clone to be on the safe side
    vertices = (vertices || []).slice(0);
    // init
    this.setState({
      closed: !!closed,
      curved: !!curved,
      beginning: 0,
      ending: 1,
    });
    this.state.renderer.type = 'path';

    // automatic --  whether two.js curves, lines, and commands should be computed
    // automatically or left to the developer.
    this.setConfig({
      cap: 'butt', // Default of Adobe Illustrator
      join: 'miter', // Default of Adobe Illustrator
      vertices: new Collection(vertices),
      automatic: !manual
    });

    this.whenVerticesChange();
    this.state.changeTracker.raise(['vertices,length']);
  }

  // --------------------
  // Flow
  // --------------------

  whenVerticesChange(oldVerticesColl) {
    if (oldVerticesColl && oldVerticesColl.dispatcher) { oldVerticesColl.dispatcher.off(); }

    var whenVectorChange = (() => {
      this.state.changeTracker.raise(['vertices','length']);
    }).bind(this);

    var whenVerticesInserted = ((items) => {
      // This function is called a lot
      // when importing a large SVG
      var i = items.length;
      while(i--) { items[i].dispatcher.on(VectorEvent.change, whenVectorChange); }
      whenVectorChange();
    }).bind(this);

    var whenVerticesRemoved = ((items) => {
      var i = items.length;
      while(i--) { items[i].dispatcher.off(VectorEvent.change, whenVectorChange); }
      whenVectorChange();
    }).bind(this);

    // Listen for Collection changes and bind / unbind
    var {vertices} = this.state;
    vertices.dispatcher.on(CollectionEvent.insert, whenVerticesInserted);
    vertices.dispatcher.on(CollectionEvent.remove, whenVerticesRemoved);
    // Bind Initial Vertices
    whenVerticesInserted(this.state.vertices);

  }

  whenLengthChange(limit) {
    this._update();
    var {lengths, sum} = updateLength({
      limit,
      vertices: this.vertices,
      pathClosed: this.state.closed,
      lastClosed: (arrayLast(this.vertices).command === Commands.CLOSE) ? true : false,
      lengths: this.state.lengths
    });
    this.state.lengths = lengths;
    this.state.length = sum;

    return this;

  }
  // --------------------
  // Accessors
  // --------------------

  get length() {
    if(this.state.changeTracker.oneChange('length')) {
      this.whenLengthChange();
    }
    return this.state.length;
  }

  get closed() {
    return this.state.closed;
  }
  set closed(v) {
    this.state.closed = !!v;
    this.state.changeTracker.raise(['vertices']);
  }

  get curved() {
    return this.state.curved;
  }
  set curved(v) {
    this.state.curved = !!v;
    this.state.changeTracker.raise(['vertices']);
  }

  get automatic() {
    return this.state.automatic;
  }
  set automatic(v) {
    if (v === this.state.automatic) {
      return;
    }
    this.state.automatic = !!v;
    var method = this.state.automatic ? 'ignore' : 'listen';
    (this.vertices || []).forEach(function(v) {
      v[method]();
    });
  }

  get beginning() {
    return this.state.beginning;
  }
  set beginning(v) {
    this.state.beginning = min(max(v, 0.0), this.state.ending);
    this.state.changeTracker.raise(['vertices']);
  }

  get ending() {
    return this.state.ending;
  }
  set ending(v) {
    this.state.ending = min(max(v, this.state.beginning), 1.0);
    this.state.changeTracker.raise(['vertices']);
  }

  /**
   * A `Collection` of `Anchors` that is two-way databound.
   * Individual vertices may be manipulated.
   */
  get vertices() {
    return this.state.vertices;
  }
  set vertices(vertices) {
    var oldVerticesColl = this.state.vertices;
    // Create new Collection with copy of vertices
    var clone = (vertices || []).slice(0);
    this.setState({vertices: new Collection(clone)});
    this.whenVerticesChange(oldVerticesColl);
  }

  get clip() {
    return this.state.clip;
  }
  set clip(v) {
    this.state.clip = v;
    this.state.changeTracker.raise(['clip']);
  }

  // -----------------
  // Pseudo accessors
  // -----------------

  /**
   * Removes the fill.
   */
  noFill() {
    this.state.fill = 'transparent';
    this.state.changeTracker.raise(['fill']);
    return this;
  }

  /**
   * Removes the stroke.
   */
  noStroke() {
    this.state.stroke = 'transparent';
    this.state.changeTracker.raise(['stroke']);
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
    // :NOTE: this.getBoundingClientRect will call this._update first
    var {x,y} = rectTopLeft(this.getBoundingClientRect(true));
    (this.vertices || []).forEach(function(v) { v.subSelf(x,y); });
    return this;
  }

  /**
   * Orient the vertices of the shape to the center of the
   * path.
   */
  center() {
    // :NOTE: this.getBoundingClientRect will call this._update first
    var {x,y} = rectCentroid(this.getBoundingClientRect(true));
    (this.vertices || []).forEach(function(v) { v.subSelf(x,y); });
    return this;
  }

  /**
   * If added to a `scene`, removes itself from it.
   */
  remove() {
    // early exit
    if (!this.parent) { return this; }
    // main
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
    var {vertices, closed} = this.getState();
    if (this.curved) {
      pathFN.getCurveFromPoints(vertices, closed);
      return this;
    }
    for (var i = 0; i < vertices.length; i++) {
      vertices[i].command = i === 0 ? Commands.MOVE : Commands.LINE;
    }
    return this;
  }

  /**
   * Creates a new set of vertices that are lineTo anchors. For previously straight lines the anchors remain the same. For curved lines, however, Two.Utils.subdivide is used to generate a new set of straight lines that are perceived as a curve.
   */
  subdivide(limit) {
    this._update();
    this.state.automatic = false;
    this.state.curved = false;
    this.vertices = subdivideTo({
      limit,
      vertices: this.vertices,
      pathClosed : this.state.closed,
      lastClosed : (arrayLast(this.vertices).command === Commands.CLOSE) ? true : false,
      automatic: this.state.automatic
    });
    return this;
  }

  // -----------------
  // Private
  // -----------------

  _update() {
    var shp = this;
    if(this.state.changeTracker.oneChange('vertices'))  {
      var {vertices, beginning, ending, automatic} = shp.getState();
      vertices = copyVertices({ vertices, beginning, ending });
      this.setState({vertices});
      if (automatic) { this.plot(); }
    }

    Shape.prototype._update.apply(shp, arguments);

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
    var shp = this;
    // TODO: Update this to not __always__ update. Just when it needs to.
    shp._update(true);
    var {linewidth, vertices} = shp.getState();
    var matrix = !!shallow ? this._matrix : getComputedMatrix(this);
    var border = linewidth / 2;
    var length = vertices.length;
    return getPathBoundingRect(matrix, border, length, vertices);
  }

  // -----------------
  // IRenderable
  // -----------------

  flagReset() {
    super.flagReset();
    var {changeTracker} = this.state;
    changeTracker.drop(['opacity','visible','clip']);
    changeTracker.drop(['fill','stroke','linewidth','decoration']);
    changeTracker.drop(['vertices']);
    changeTracker.drop(['cap, join, miter']);

    return this;

  }

  /**
   * Returns a new instance of a `Path` with the same settings.
   */
  clone(parent) {
    var shp = this;
    parent = parent || shp.parent;
    var  {closed, curved, automatic, vertices} = shp.getState();
    var points = vertices.map((d) => { return d.clone(); });
    var clone = cloneProperties(
      shp, new Path(points, closed, curved, !automatic), Path.Properties
    );
    parent.add(clone);
    return clone;
  }

  toObject() {
    var shp = this;
    var obj = serializeProperties(shp, {}, []);
    var  {closed, curved, automatic, vertices} = shp.getState();
    obj.vertices = vertices.map((d) => { return d.toObject(); });
    return obj;
  }
}


Path.Properties = Object.keys(DefaultValues.Path);

// unraisedFlag: clip
// don't require???
defineSecretAccessors({
  proto: Path.prototype,
  accessors: Path.Properties.filter((d) => { return true || !'length,closed,curved,automatic,beginning,ending,clip'.includes(d); }),
  secrets: Path.Properties
});

// direct, not secreted
Path.Properties.forEach((k) => { Path.prototype[k] = DefaultValues.Path[k]; });

export default Path;
