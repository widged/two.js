/* jshint esnext: true */

import IMPORTS    from '../_imports';
import Renderable from '../Renderable';
import groupFN from './group-fn';

const {Collection, CollectionEventTypes} = IMPORTS;
const {RenderableDefaults} = IMPORTS;
const {is, common, exportFN, rectFN, rendererBridge} = IMPORTS;

const {isNumber, isArray, isUndefined} = is;
const {exclude, arrayOrArguments}  = common;
const {serializeProperties} = exportFN;
const {rectCentroid, rectTopLeft, includePointInBoundingRect} = rectFN;
const {adoptShapes, dropShapes, addShapesToList, removeShapesFromChildren, removeGroupFromParent} = groupFN;
const {translateChildren} = groupFN;
const {updateShape}      = rendererBridge;

const PROP_DEFAULTS= RenderableDefaults.Group;
const PROP_KEYS = Object.keys(PROP_DEFAULTS);

/**
 * A `Group` is a container object — it can hold shapes as well as other groups.
 * At a technical level it can be considered an empty transformation matrix.
 * It is recommended to use two.makeGroup() in order to add groups to your instance
 * of two, but it's not necessary. Unless specified methods return their instance
 * of Group for the purpose of chaining.
 */
class Group extends Renderable {

  /**
   * If you are constructing groups this way instead of two.makeGroup(), then don't
   * forget to add the group to the instance's scene, two.add(group).
   */
  constructor(...shapes) {
    super();
    this.setState({
      ids: [],
      additions: [],
      substractions : []
    });
    var props = PROP_DEFAULTS;
    // childrenColl - A Collection of all the children of the group.
    if(!isUndefined(shapes)) { props.childrenColl = shapes; }
    this.setProps(props);

    // var excluded = 'closed,curved,automatic,beginning,ending,mask'.split(',')
    // unraised flags: 'additions,substractions,order,mask'
  }


  // -----------------
  // IStated
  // -----------------

  beforePropertySet(k, v) {
    v = super.beforePropertySet(k, v);
    if(k === 'childrenColl') {
        var oldChildren = this.getState().childrenColl;
        if (oldChildren && oldChildren.dispatcher) { oldChildren.dispatcher.off(); }
        v = new Collection(v);
    }
    return v;
  }
  afterPropertyChange(k, v, oldV) {
    if(k === 'childrenColl') {
      var childrenColl = v;
      childrenColl.dispatcher.on(CollectionEventTypes.insert, this.bindOnce('whenChildrenInserted', (childrenColl) => { adoptShapes(this, childrenColl); } ));
      childrenColl.dispatcher.on(CollectionEventTypes.remove, this.bindOnce('whenChildrenRemoved', (childrenColl) => { dropShapes(this, childrenColl); } ));
      childrenColl.dispatcher.on(CollectionEventTypes.order, this.bindOnce('whenChildrenShuffled', () => { this.getState().changeTracker.raise(['order']); } ));
    } else if(k === 'mask') {
      this.getState().changeTracker.raise(['mask']);
      if (v && !v.clip) { v.clip = true; }
    }
  }


  // --------------------
  // Accessors
  // --------------------

  get children() {
    return this.state.childrenColl.items;
  }

  get ids() {
    return this.state.ids;
  }

  set ids(_) {
    this.state.ids = _;
  }

  // --------------------
  // Main
  // --------------------

  /**
   * Anchor all childrenColl to the top left corner of the group.
   */
  corner() {
    this.setState({pointTowards: rectTopLeft });
    return this;
  }

  /**
   * Anchors all childrenColl around the centroid of the group,
   * effectively placing the shape around the unit circle.
   */
  center() {
    this.setState({pointTowards: rectCentroid });
    return this;
  }


  /**
   * Add one or many shapes / groups to the instance. Objects can be added as
   * arguments, two.add(o1, o2, oN), or as an Array.
   */
   add(...objects) {
    // Create copy of it in case we're getting passed a childrenColls array directly.
    objects = arrayOrArguments(objects).slice(0);
    const {childrenColl} = this.getProps();
    this.state.props.childrenColl = addShapesToList(objects, childrenColl);
    return this;
  }

  /**
   * Remove one or many shapes / groups to the instance. Objects can be removed as
   * arguments, two.remove(o1, o2, oN), or as an array.
   */
  remove(...objects) {
    // Create copy of it in case we're getting passed a childrenColls array directly.
    objects = arrayOrArguments(objects).slice(0);
    // If no objects are specified, remove the group from the parent group.
    if (!objects) { this.parent = removeGroupFromParent(this, this.parent); }
    const {childrenColl} = this.getProps();
    this.state.props.childrenColl = removeShapesFromChildren(objects, childrenColl);

    return this;

  }

  // -----------------
  // Trickle down
  // -----------------

  /**
   * Trickle down to all childrenColl in the group
   */
  trickleDown(fn) {
    this.state.childrenColl.forEach(fn);
    return this;
  }
  noFill()           { return this.trickleDown((d) => { d.noFill(); }); }
  noStroke()         { return this.trickleDown((d) => { d.noStroke(); }); }
  subdivide(...args) { return this.trickleDown((d) => { d.subdivide.apply(d, args); }); }

  // -----------------
  // IRenderable
  // -----------------

  get shapeType() { return 'group'; }

  flagReset() {
    super.flagReset();
    this.state.changeTracker.drop(['additions','substractions']);
    this.state.changeTracker.drop(['order','mask','opacity']);
    this.state.additions = [];
    this.state.substractions = [];
    return this;

  }

  // -----------------
  // IExportable
  // -----------------

  /**
   * Returns a new instance of a Two.Group with the same settings.
   * This will copy the `children` as well, which can be computationally expensive.
   */
   /*
    :TODO: Group has a gotcha in that it's at the moment required to be bound to
    an instance of two in order to add elements correctly. This needs to
    be rethought and fixed.
    :NOTE: Not used internally, only called by the user
   */
  clone() {
    var shp = this;
    var clone = new Group();
    for (let i = 0, ni = PROP_KEYS.length, k = null; i < ni; i++) {
      k = PROP_KEYS[i];
      clone[k] = shp[k];
    }
    // now clone all childrenColl recursively and add them to this group
    var childrenColl = (shp.state.childrenColl || []).map((child) => {
      var childClone = child.clone(clone);
      clone.add(childClone);
      return childClone;
    });
    return clone;
  }

  /**
   * Export the data from the instance of Group into a plain JavaScript
   * object. This also makes all `children` plain JavaScript objects. Great
   * for turning into JSON and storing in a database.
   */
   // :NOTE: Not used internally, only called by the user
  toObject() {
    var shp = this;
    var obj = super.toObject();
    obj = serializeProperties(shp, obj);
    // now copy all childrenColl recursively
    obj.childrenColl =  (shp.state.childrenColl || []).map((child) => {
      return shp.toObject();
    });
    return obj;

  }
}


export default Group;
