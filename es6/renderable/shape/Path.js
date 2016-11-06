/* jshint esnext: true */

import IMPORTS    from '../_imports';
import Renderable from '../Renderable';

const {Collection, CollectionEventTypes} = IMPORTS;
const {Anchor, Vector, VectorEventTypes} = IMPORTS;
const {RenderableDefaults} = IMPORTS;
const {is, common, curveFN, rectFN, exportFN, shapeRendering} = IMPORTS;

var {isUndefined, isNull} = is;
var {arrayLast}           = common;
var {subdivideTo, updateLength} = curveFN;
var {rectTopLeft, rectCentroid} = rectFN;
var {serializeProperties}       = exportFN;
var {updateShape, copyVertices} = shapeRendering;

var {min, max, round} = Math;

const PROP_DEFAULTS= RenderableDefaults.Path;
const PROP_KEYS = Object.keys(PROP_DEFAULTS);

/**
 * A `Path` is the base class for creating all drawable shapes in two.js. By default,
 * methods return their instance of Path for the purpose of chaining.
 *
 * A path takes an array of `Anchors`. This is essential for the two-way databinding.
 * It then takes two booleans, closed and curved which delineate whether the shape
 * should be closed (lacking endpoints) and whether the shape should calculate
 * curves or straight lines between the vertices. Finally, manual is an optional
 * argument if you'd like to override the default behavior of two.js and handle anchor
 * positions yourself. Generally speaking, this isn't something you need to deal
 * with, although some great usecases arise from this customability, e.g: advanced curve manipulation.
 *
 * NB. If you are constructing groups this way instead of two.makePath(), then
 * don't forget to add the group to the instance's scene, two.add(group).
 */

class Path extends Renderable {

  constructor(anchors, closed, curved, manual) {
    super();
    // init
    var props = PROP_DEFAULTS;
    props.cap  = 'butt'; // Default of Adobe Illustrator
    props.join = 'miter'; // Default of Adobe Illustrator
    props.beginning = 0;
    props.ending    = 1;
    // vertices -- A `Collection` of `Anchors` that is two-way databound. Individual vertices may be manipulated.
    // let's clone to be on the safe side
    if(!isUndefined(anchors)) { props.vertices = (anchors || []).slice(0); }
    // automatic --  whether two.js curves, lines, and commands should be computed
    if(!isUndefined(manual))  { props.automatic = !manual; }
    if(!isUndefined(closed))  { props.closed = !!closed; }
    if(!isUndefined(curved))  { props.curved = !!curved; }
    this.setProps(props);
  }

  // --------------------
  // IStated
  // --------------------

  beforePropertySet(k, v) {
    v = super.beforePropertySet(k, v);
    if(k === 'vertices') {
      // remove any even listener from the current vertices
      this.disactivateAnchors(this.getState().vertices);
      v = new Collection(v);
    } else if(['closed','curved','automatic'].includes(k)) {
      v = (v === true) ? true : false;
    }
    if(k === 'automatic') {
      var oldAuto = this.getState().automatic;
      if(v !== oldAuto) {
        var method = v ? 'ignore' : 'listen';
        (this.getState().vertices || []).forEach(function(v) { v[method](); });
      }
    } else if(k === 'beginning') {
      v = min(max(v, 0.0), this.getState().ending || 0);
    } else if(k === 'ending') {
      v = min(max(v, this.getState().beginning || 0), 1.0);
    } else if(k === 'vertices') {
      var oldV = this.getState().vertices;
      if (oldV && typeof oldV.dispatcher === 'function') { oldV.dispatcher.off(); }
      if(v.constructor.name === 'Array') {
        // v = new Collection((v || []).slice(0));
      }
    }
    return v;
  }
  afterPropertyChange(k, v, oldV) {
    super.afterPropertyChange(k, v, oldV);
    var {changeTracker} = this.getState();
    if(k === 'vertices') {
      // Listen for Collection changes and bind / unbind
      var vertices = v;
      if (vertices && typeof vertices.dispatcher === 'function') {
        vertices.dispatcher.on(CollectionEventTypes.insert, this.bindOnce('activateAnchors',    () => { this.activateAnchors(v);   }));
        vertices.dispatcher.on(CollectionEventTypes.remove, this.bindOnce('disactivateAnchors', () => { this.disactivateAnchors(v); }));
      }
      // Bind Initial Vertices
      this.activateAnchors(vertices);
      this.getState().changeTracker.raise(['vertices','length']);     // unraisedFlag: clip
    } else if(['closed','curved','beginning','ending'].includes(k) && v !== oldV) {
      changeTracker.raise(['vertices']);
    } else if(['clip'].includes(k) && v !== oldV) {
      changeTracker.raise(['clip']);
    }
  }

  // --------------------
  // Flow
  // --------------------

  activateAnchors(anchors)  {
    var i = (anchors || []).length, anchor = null;
    while(i--) {
      anchor = anchors[i];
      if(anchor && anchor.dispatcher) {
        anchor.dispatcher.on(VectorEventTypes.change, this.bindOnce('vectorChange', () => { this.getState().changeTracker.raise(['vertices']); } ));
      }
    }
  }

  disactivateAnchors(anchors)  {
    var i = (anchors || []).length, anchor = null;
    while(i--) {
      anchor = anchors[i];
      anchor.dispatcher.off(VectorEventTypes.change, this.bindOnce('vectorChange', () => { this.getState().changeTracker.raise(['vertices']); } ));
    }
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
    this.setState({pointTowards: rectTopLeft });
    return this;
  }

  /**
   * Orient the vertices of the shape to the center of the
   * path.
   */
  center() {
    this.setState({pointTowards: rectCentroid });
    return this;
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
