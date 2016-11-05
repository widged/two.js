/* jshint esnext: true */

import CollectionEventTypes   from '../constant/CollectionEventTypes';
import _  from '../util/common';
import is  from '../util/is';
import Path  from './Path';
import Shape  from '../Shape';
import shapeFN    from '../shape-fn';
import groupFN  from './fn-group';
import Children  from '../ChildrenCollection';
import DefaultValues from '../constant/DefaultValues';
import shapeRendering   from '../renderer-lib/renderer-bridge';

var {updateShape} = shapeRendering;

var {isNumber, isArray} = is;
var {exclude, arrayOrArguments}  = _;
var {serializeProperties, rectCentroid, rectTopLeft} = shapeFN;
var {adoptShapes, dropShapes, addShapesToChildren, removeShapesFromChildren, removeGroupFromParent} = groupFN;
var {translateChildren} = groupFN;

const PROP_DEFAULTS = DefaultValues.Group;
const PROP_KEYS = Object.keys(PROP_DEFAULTS);

var nodeChildren = (node) => { return (node instanceof Group) ? node.children : undefined; };


/**
 * A `Group` is a container object — it can hold shapes as well as other groups.
 * At a technical level it can be considered an empty transformation matrix.
 * It is recommended to use two.makeGroup() in order to add groups to your instance
 * of two, but it's not necessary. Unless specified methods return their instance
 * of Group for the purpose of chaining.
 */
class Group extends Shape {

  /**
   * If you are constructing groups this way instead of two.makeGroup(), then don't
   * forget to add the group to the instance's scene, two.add(group).
   */
  constructor(...shapes) {
    super();

    // any definition bound to this should be defined once and only once,
    // in the constructor
    this.bound = {
      whenChildrenInserted : ((children) => { adoptShapes(this, children); }).bind(this),
      whenChildrenRemoved : ((children) => { dropShapes(this, children); }).bind(this),
      whenChildrenShuffled : (() => { changeTracker.raise(['order']); }).bind(this)
    };

        
    this.setState({
      additions: [],
      substractions : []
    });

    this.setProps(PROP_DEFAULTS);
    this.setProps({
      children: shapes,
    });
    var {renderer, changeTracker} = this.getState();
    renderer.type = 'group';



    /**
    * children - A Collection of all the children of the group.
    */


    changeTracker.raise(['opacity']);

    // var excluded = 'closed,curved,automatic,beginning,ending,mask'.split(',')
    // unraised flags: 'additions,substractions,order,mask'

  }

  // --------------------
  // Accessors
  // --------------------

  get children() { return this.state.children; }
  set children(shapes) {
    var oldChildren = this.state.children;
    this.setState({
      children: shapes
    });
  }

  get mask() { return this.state.mask; }
  set mask(v) {
    var state =
    this.setState({mask: v});
    this.getState().changeTracker.raise(['mask']);
    if (!v.clip) { v.clip = true; }
  }

  beforePropertySet(key, newV) {
    newV = super.beforePropertySet(key, newV);
    if(key === 'children') {
        var oldChildren = this.getState().children;
        if (oldChildren && oldChildren.dispatcher) { oldChildren.dispatcher.off(); }
        newV = new Children(newV);
    }
    return newV;
  }
  afterPropertyChange(key, newV, oldV) {
    if(key === 'children') {
      var children = newV;
      children.dispatcher.on(CollectionEventTypes.insert, this.bound.whenChildrenInserted);
      children.dispatcher.on(CollectionEventTypes.remove, this.bound.whenChildrenRemoved);
      children.dispatcher.on(CollectionEventTypes.order, this.bound.whenChildrenShuffled);

    }

  }

  // --------------------
  // Main
  // --------------------

  /**
   * Anchor all children to the top left corner of the group.
   */
   // :TODO: leave any rendering action (translate) to the renderers
  corner() {
    var shp = this;
    updateShape(shp, true);
    var {children} = this.getState();
    children = translateChildren( children, rectTopLeft);
    this.setState({children});
    return this;
  }

  /**
   * Anchors all children around the centroid of the group,
   * effectively placing the shape around the unit circle.
   */
   // :REVIEW: this causes unwanted behaviors... optional rather than default behavior?
   // :TODO: leave any rendering action (translate) to the renderers
  center() {
    var shp = this;
    updateShape(shp, true);
    var {children} = this.getState();
    children = translateChildren( children, rectCentroid);
    this.setState({children});
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
  // IBounded
  // -----------------

  /**
   * Returns an object with top, left, right, bottom, width, and height parameters
   * representing the bounding box of the path. Pass true if you're interested in
   * the shallow positioning, i.e in the space directly affecting the object and
   * not where it is nested.
   */
  getBoundingClientRect(shallow) {
    var shp = this;
    // TODO: Update this to not __always__ update. Just when it needs to.
    updateShape(shp, true);
    var {children} = shp.getState();
    return groupFN.getEnclosingRect({shallow, children: children});
  }

  // -----------------
  // IRenderable
  // -----------------


  flagReset() {
    super.flagReset();
    this.state.changeTracker.drop(['additions','substractions']);
    this.state.changeTracker.drop(['order','mask','opacity']);
    this.state.additions = [];
    this.state.substractions = [];
    return this;

  }

  /**
   * Returns a new instance of a Two.Group with the same settings.
   * This will copy the children as well, which can be computationally expensive.
   *
   * TODO: Group has a gotcha in that it's at the moment required to be bound to
   * an instance of two in order to add elements correctly. This needs to
   * be rethought and fixed.
   */
  clone() {
    console.log('ONLY CALLED BY USER')
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

Group.Children = Children;


export default Group;
