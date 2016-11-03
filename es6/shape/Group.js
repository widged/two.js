/* jshint esnext: true */

import CollectionEvent   from '../constant/CollectionEvent';
import _  from '../util/common';
import is  from '../util/is';
import Path  from './Path';
import Shape  from '../Shape';
import shapeFN    from '../shape-fn';
import groupFN  from './group-fn';
import Children  from '../ChildrenCollection';
import DefaultValues from '../constant/DefaultValues';
import shapeRendering from '../shape-rendering';

var {isNumber, isArray} = is;
var {exclude, arrayOrArguments}  = _;
var {cloneProperties, serializeProperties, defineSecretAccessors, rectCentroid, rectTopLeft} = shapeFN;
var {adoptShapes, dropShapes, addShapesToChildren, removeShapesFromChildren, removeGroupFromParent} = groupFN;
var {translateChildren} = groupFN;
var {dropFlags, raiseFlags} = shapeRendering;

var nodeChildren = (node) => { return (node instanceof Group) ? node.children : undefined; };

/**
 * This is a container object — it can hold shapes as well as other groups.
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
    super(true);

    this.state = {
      children: new Children(shapes)
    };

    this.bound = {
      whenChildrenInserted: ((children) => { adoptShapes(this, children); }).bind(this),
      whenChildrenRemoved: ((children) => { dropShapes(this, children); }).bind(this),
      whenChildrenShuffled: (() => { raiseFlags(this, ['order']); }).bind(this)
    };

    /**
    * id - The id of the group. In the svg renderer this is the same number as the id attribute given to the corresponding node. i.e: if group.id = 5 then document.querySelector('#two-' + group.id) will return the corresponding node.
    * children - A Collection of all the children of the group.
    * parent - A reference to the Two.Group that contains this instance.
    * mask - A reference to the Two.Path that masks the content within the group. Automatically sets the referenced Two.Path.clip to true.
    */
    this._renderer.type = 'group';
    this.additions = [];
    this.subtractions = [];

    this.whenChildrenSet();
  }

  // --------------------
  // Accessors
  // --------------------

  get children() {
    return this.state.children;
  }
  set children(shapes) {
    if (this.state.children) { this.state.children.dispatcher.off(); }
    this.state.children = new Children(shapes);
    this.whenChildrenSet();
  }

  whenChildrenSet() {
    this.state.children.dispatcher.on(CollectionEvent.insert, this.bound.whenChildrenInserted);
    this.state.children.dispatcher.on(CollectionEvent.remove, this.bound.whenChildrenRemoved);
    this.state.children.dispatcher.on(CollectionEvent.order, this.bound.whenChildrenShuffled);
  }

  get mask() {
    return this._mask;
  }
  set mask(v) {
    this._mask = v;
    raiseFlags(this, ['mask']);
    if (!v.clip) {
      v.clip = true;
    }
  }

  // --------------------
  // Main
  // --------------------

  /**
   * Anchor all children to the top left corner of the group.
   */
  corner() {
    this._update(true);
    this.state.children = translateChildren( this.state.children, rectTopLeft);
    return this;
  }

  /**
   * Anchors all children around the centroid of the group,
   * effectively placing the shape around the unit circle.
   */
   // :REVIEW: this causes unwanted behaviors... optional rather than default behavior?
  center() {
    this._update(true);
    this.state.children = translateChildren( this.state.children, rectCentroid );
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
    // TODO: Update this to not __always__ update. Just when it needs to.
    this._update(true);
    return groupFN.getEnclosingRect({shallow, children: this.state.children});
  }

  // -----------------
  // IRenderable
  // -----------------


  flagReset() {
    super.flagReset();
    dropFlags(this, ['additions','subtractions']);
    dropFlags(this, ['order','mask','opacity']);
    this.additions = [];
    this.subtractions = [];
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
  clone(parent) {

    parent = parent || this.parent;
    var clone = cloneProperties(this, new Group(), []);
    parent.add(clone);
    // now clone all children recursively
    var children = (this.state.children || []).map((child) => {
      return child.clone(clone);
    });
    return clone;
  }

  /**
   * Export the data from the instance of Group into a plain JavaScript
   * object. This also makes all children plain JavaScript objects. Great
   * for turning into JSON and storing in a database.
   */
  toObject() {
    var obj = serializeProperties(this, {}, []);
    // now copy all children recursively
    obj.children =  (this.state.children || []).map((child) => {
      return child.toObject();
    });
    return obj;

  }
}

Group.Children = Children;
Group.Properties = Object.keys(DefaultValues.Group);

// var excluded = 'closed,curved,automatic,beginning,ending,mask'.split(',')
// unraised flags: 'additions,substractions,order,mask'
defineSecretAccessors({proto: Group.prototype, accessors: Group.Properties, raisedFlags: ['opacity'] , secrets: DefaultValues.Group, onlyWhenChanged: ['opacity'] });

export default Group;
