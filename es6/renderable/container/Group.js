/* jshint esnext: true */

import IMPORTS    from '../_imports';
import Renderable from '../Renderable';
import ChildrenCollection from './ChildrenCollection';

const {Collection, CollectionEventTypes} = IMPORTS;
const {RenderableDefaults} = IMPORTS;
const {is, common, exportFN, rectFN, groupFN, shapeRendering} = IMPORTS;

const {isNumber, isArray, isUndefined} = is;
const {exclude, arrayOrArguments}  = common;
const {serializeProperties} = exportFN;
const {rectCentroid, rectTopLeft, includeAnchorInBoundingRect} = rectFN;
const {adoptShapes, dropShapes, addShapesToChildren, removeShapesFromChildren, removeGroupFromParent} = groupFN;
const {translateChildren} = groupFN;
const {updateShape} = shapeRendering;


const PROP_DEFAULTS= RenderableDefaults.Group;
const PROP_KEYS = Object.keys(PROP_DEFAULTS);

var nodeChildren = (node) => { return (node instanceof Group) ? node.children : undefined; };


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
      additions: [],
      substractions : []
    });
    var props = PROP_DEFAULTS;
    // children - A Collection of all the children of the group.
    if(!isUndefined(shapes)) { props.children = shapes; }
    this.setProps(props);

    // var excluded = 'closed,curved,automatic,beginning,ending,mask'.split(',')
    // unraised flags: 'additions,substractions,order,mask'
  }

  // --------------------
  // Accessors
  // --------------------

  get children() { return this.state.children; }

  beforePropertySet(k, v) {
    v = super.beforePropertySet(k, v);
    if(k === 'children') {
        var oldChildren = this.getState().children;
        if (oldChildren && oldChildren.dispatcher) { oldChildren.dispatcher.off(); }
        v = new ChildrenCollection(v);
    }
    return v;
  }
  afterPropertyChange(k, v, oldV) {
    if(k === 'children') {
      var children = v;
      children.dispatcher.on(CollectionEventTypes.insert, this.bindOnce('whenChildrenInserted', (children) => { adoptShapes(this, children); } ));
      children.dispatcher.on(CollectionEventTypes.remove, this.bindOnce('whenChildrenRemoved', (children) => { dropShapes(this, children); } ));
      children.dispatcher.on(CollectionEventTypes.order, this.bindOnce('whenChildrenShuffled', () => { this.getState().changeTracker.raise(['order']); } ));
    } else if(k === 'mask') {
      this.getState().changeTracker.raise(['mask']);
      if (v && !v.clip) { v.clip = true; }
    }
  }

  // --------------------
  // Main
  // --------------------

  /**
   * Anchor all children to the top left corner of the group.
   */
  corner() {
    this.setState({pointTowards: rectTopLeft });
    return this;
  }

  /**
   * Anchors all children around the centroid of the group,
   * effectively placing the shape around the unit circle.
   */
  center() {
    this.setState({pointTowards: rectCentroid });
    return this;
  }

  /**
   * Recursively search for id. Returns the first element found.
   * Returns null if none found.
   */
  getById (id) {
    return groupFN.findFirstMember(
      this, groupFN.nodeChildren,
      (node) => { return node.id === id; }
    );
  }

  /**
   * Add one or many shapes / groups to the instance. Objects can be added as
   * arguments, two.add(o1, o2, oN), or as an Array.
   */
   add(...objects) {
    // Create copy of it in case we're getting passed a childrens array directly.
    objects = arrayOrArguments(objects).slice(0);
    this.state.children = addShapesToChildren(objects, this.state.children);
    return this;
  }

  /**
   * Remove one or many shapes / groups to the instance. Objects can be removed as
   * arguments, two.remove(o1, o2, oN), or as an array.
   */
  remove(...objects) {
    // Create copy of it in case we're getting passed a childrens array directly.
    objects = arrayOrArguments(objects).slice(0);
    // If no objects are specified, remove the group from the parent group.
    if (!objects) { this.parent = removeGroupFromParent(this, this.parent); }
    this.state.children = removeShapesFromChildren(objects, this.state.children);

    return this;

  }

  // -----------------
  // Trickle down
  // -----------------

  /**
   * Trickle down to all children in the group
   */
  trickleDown(fn) {
    this.state.children.forEach(fn);
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
   * This will copy the children as well, which can be computationally expensive.
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
    // now clone all children recursively and add them to this group
    var children = (shp.state.children || []).map((child) => {
      var childClone = child.clone(clone);
      clone.add(childClone);
      return childClone;
    });
    return clone;
  }

  /**
   * Export the data from the instance of Group into a plain JavaScript
   * object. This also makes all children plain JavaScript objects. Great
   * for turning into JSON and storing in a database.
   */
   // :NOTE: Not used internally, only called by the user
  toObject() {
    var shp = this;
    var obj = super.toObject();
    obj = serializeProperties(shp, obj);
    // now copy all children recursively
    obj.children =  (shp.state.children || []).map((child) => {
      return shp.toObject();
    });
    return obj;

  }
}


export default Group;
