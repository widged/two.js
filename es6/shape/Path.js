/* jshint esnext: true */

import DefaultValues from '../constant/DefaultValues';
import CollectionEventTypes   from '../constant/CollectionEventTypes';
import VectorEventTypes   from '../constant/VectorEventTypes';
import Commands from '../constant/CommandTypes';
import _  from '../util/common';
import is  from '../util/is';
import Collection  from '../struct/Collection';

import Anchor  from '../Anchor';
import Shape from '../Shape';
import shapeFN from '../shape-fn';
import pathFN  from './fn-path';
import shapeRendering   from '../renderer-lib/renderer-bridge';

var {updateShape, copyVertices} = shapeRendering;

var {isUndefined, isNull} = is;
var {arrayLast} = _;
var {getComputedMatrix, getCurveLengthAB, subdivideTo, updateLength, rectTopLeft, rectCentroid} = pathFN;
var {min, max, round} = Math;
var {serializeProperties, getPathBoundingRect} = shapeFN;

const PROP_DEFAULTS = DefaultValues.Path;
const PROP_KEYS = Object.keys(PROP_DEFAULTS);

/**
 * A `Path` is the base class for creating all drawable shapes in two.js. By default,
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
    // init
    this.setState(PROP_DEFAULTS);
    var {changeTracker} = this.getState();

    // let's clone to be on the safe side
    var clone = (vertices || []).slice(0);
    this.setState({
      cap: 'butt', // Default of Adobe Illustrator
      join: 'miter', // Default of Adobe Illustrator
      // vertices -- A `Collection` of `Anchors` that is two-way databound. Individual vertices may be manipulated.
      vertices: new Collection(clone),
      // automatic --  whether two.js curves, lines, and commands should be computed
      // automatically or left to the developer.
      automatic: !manual,
      closed: !!closed,
      curved: !!curved,
      beginning: 0,
      ending: 1,
    });
    // length,closed,curved,automatic,beginning,ending,clip
    changeTracker.raise(['vertices,length']);     // unraisedFlag: clip
    this.whenVerticesChange();
  }

  // --------------------
  // Flow
  // --------------------

  whenVerticesChange(oldVerticesColl) {
    var shp;

    var {changeTracker, vertices} = this.getState();

    var whenVectorChange = (() => {
      changeTracker.raise(['vertices','length']);
    }).bind(shp);

    var whenVerticesInserted = ((items) => {
      // This function is called a lot
      // when importing a large SVG
      var i = items.length;
      while(i--) { items[i].dispatcher.on(VectorEventTypes.change, whenVectorChange); }
      whenVectorChange();
    }).bind(shp);

    var whenVerticesRemoved = ((items) => {
      var i = items.length;
      while(i--) { items[i].dispatcher.off(VectorEventTypes.change, whenVectorChange); }
      whenVectorChange();
    }).bind(shp);

    // Listen for Collection changes and bind / unbind
    if (vertices && typeof vertices.dispatcher === 'function') {
      vertices.dispatcher.on(CollectionEventTypes.insert, whenVerticesInserted);
      vertices.dispatcher.on(CollectionEventTypes.remove, whenVerticesRemoved);
    }
    // Bind Initial Vertices
    whenVerticesInserted(vertices);

  }

  whenLengthChange(limit) {
    var shp = this;
    updateShape(shp);
    var {vertices, closed, lengths: lns} = shp.getState();
    var {lengths, sum} = updateLength({
      limit,
      vertices: vertices,
      pathClosed: closed,
      lastClosed: (arrayLast(vertices).command === Commands.CLOSE) ? true : false,
      lengths: lns
    });
    shp.setState({lengths, length: sum});
    return shp;

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
  beforePropertySet(key, newV) {
    newV = super.beforePropertySet(key, newV);
    if(['closed','curved','automatic'].includes(key)) {
      newV = (newV === true) ? true : false;
    }
    if(key === 'automatic') {
      var oldAuto = this.getState().automatic;
      if(newV !== oldAuto) {
        var method = newV ? 'ignore' : 'listen';
        (this.getState().vertices || []).forEach(function(v) { v[method](); });
      }
    } else if(key === 'beginning') {
      newV = min(max(newV, 0.0), this.getState().ending || 0);
    } else if(key === 'ending') {
      newV = min(max(newV, this.getState().beginning || 0), 1.0);
    } else if(key === 'vertices') {
      var oldV = this.getState().vertices;
      if (oldV && typeof oldV.dispatcher === 'function') { oldV.dispatcher.off(); }
      if(newV.constructor.name === 'Array') {
        // newV = new Collection((newV || []).slice(0));
      }
    }
    return newV;
  }
  afterPropertyChange(key, newV, oldV) {
    super.afterPropertyChange(key, newV, oldV);
    var {changeTracker} = this.getState();
    if(['closed','curved','beginning','ending'].includes(key) && newV !== oldV) {
      changeTracker.raise(['vertices']);
    } else if(['clip'].includes(key) && newV !== oldV) {
      changeTracker.raise(['clip']);
    } else if(key === 'vertices') {
      this.whenVerticesChange();
    }
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
  // :TODO: recode as anchorAt, delaying any rendering action
  // -----------------

  /**
   * Orient the vertices of the shape to the upper lefthand
   * corner of the path.
   */
  corner() {
    var shp = this;
    var {vertices} = shp.getState();
    // :NOTE: getBoundingClientRect will call update shape first
    var {x,y} = rectTopLeft(shp.getBoundingClientRect(true));
    for (var i = 0, ni = (vertices || []).length , v = null; i < ni; i++) {
      v = vertices[i];
      v.subSelf(x,y);
    }
    return shp;
  }

  /**
   * Orient the vertices of the shape to the center of the
   * path.
   */
  center() {
    var shp = this;
    var {vertices} = shp.getState();
    // :NOTE: getBoundingClientRect will call update shape first
    var {x,y} = rectCentroid(shp.getBoundingClientRect(true));
    for (var i = 0, ni = (vertices || []).length , v = null; i < ni; i++) {
      v = vertices[i];
      v.subSelf(x,y);
    }
    return shp;
  }

  // -----------------
  // Main
  // -----------------


  /**
   * Creates a new set of vertices that are lineTo anchors. For previously
   * straight lines the anchors remain the same. For curved lines, however,
   * `subdivide` is used to generate a new set of straight lines that are p
   * erceived as a curve.
   */
  subdivide(limit) {
    var shp = this;
    updateShape(shp);
    var automatic = false;
    var curved = false;
    var {closed, vertices} = shp.getState();
    var newVertices = subdivideTo({
      limit,
      vertices   : vertices,
      pathClosed : closed,
      lastClosed : (arrayLast(vertices).command === Commands.CLOSE) ? true : false,
      automatic: automatic
    });
    shp.setState({automatic, curved, vertices: newVertices});
    return shp;
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
     // TODO: Update only when it needs to.
     updateShape(shp, true);
     var {linewidth, vertices, matrix} = shp.getState();
     if(!shallow) { matrix = getComputedMatrix(shp); }
     var border = linewidth / 2;
     var length = vertices.length;
     return getPathBoundingRect(matrix, border, length, vertices);
   }

   // -----------------
   // IRenderable
   // -----------------

   get shapeType() { return 'path'; }

  flagReset() {
    var shp = this;
    super.flagReset();
    var {changeTracker} = shp.getState();
    changeTracker.drop(['opacity','visible','clip']);
    changeTracker.drop(['fill','stroke','linewidth','decoration']);
    changeTracker.drop(['vertices']);
    changeTracker.drop(['cap, join, miter']);

    return shp;

  }

  // -----------------
  // IExportable
  // -----------------

  /**
   * Returns a new instance of a `Path` with the same settings.
   */
   // :NOTE: Not used internally, only called by the user
  clone() {
    var shp = this;
    var  {closed, curved, automatic, vertices} = shp.getState();
    var anchors = vertices.map((d) => { return d.clone(); });
    var clone = new Path(anchors, closed, curved, !automatic);
    for (let i = 0, ni = PROP_KEYS.length, k = null; i < ni; i++) {
      k = PROP_KEYS[i];
      clone[k] = shp[k];
    }
    return clone;
  }

  // :NOTE: Not used internally, only called by the user
  toObject() {
    var shp = this;
    super.toObject();

    var obj = serializeProperties(shp, {}, []);

    var  {closed, curved, automatic, vertices} = shp.getState();
    obj.vertices = vertices.map((d) => { return d.toObject(); });
    return obj;
  }
}




export default Path;
