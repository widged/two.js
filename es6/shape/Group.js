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

var {isNumber, isArray} = is;
var {exclude}  = _;
var {cloneProperties, serializeProperties, defineSecretAccessors} = shapeFN;

var nodeChildren = (node) => { return (node instanceof Group) ? node.children : undefined; };

/**
 * This is a container object — it can hold shapes as well as other groups.
 *  At a technical level it can be considered an empty transformation matrix.
 * It is recommended to use two.makeGroup() in order to add groups to your instance
 * of two, but it's not necessary. Unless specified methods return their instance
 * of Group for the purpose of chaining.
*/

/*
construction var group = new Two.Group();
 If you are constructing groups this way instead of two.makeGroup(), then don't forget to add the group to the instance's scene, two.add(group).

id group.id
The id of the group. In the svg renderer this is the same number as the id attribute given to the corresponding node. i.e: if group.id = 5 then document.querySelector('#two-' + group.id) will return the corresponding node.


children group.children
A map of all the children of the group.

parent group.parent
A reference to the Two.Group that contains this instance.

mask group.mask
A reference to the Two.Path that masks the content within the group. Automatically sets the referenced Two.Path.clip to true.

clone group.clone();
Returns a new instance of a Two.Group with the same settings.
 This will copy the children as well, which can be computationally expensive.

center group.center();
Anchors all children around the centroid of the group.

addTo group.addTo(group);
Adds the instance to a Two.Group. In many ways the inverse of two.add(object).

add group.add(objects);
Add one or many shapes / groups to the instance. Objects can be added as arguments, two.add(o1, o2, oN), or as an array depicted above.

remove group.remove(objects);
Remove one or many shapes / groups to the instance. Objects can be removed as arguments, two.remove(o1, o2, oN), or as an array depicted above.

getBoundingClientRect group.getBoundingClientRect(shallow);
Returns an object with top, left, right, bottom, width, and height parameters representing the bounding box of the path. Pass true if you're interested in the shallow positioning, i.e in the space directly affecting the object and not where it is nested.

noFill group.noFill();
Remove the fill from all children of the group.

noStroke group.noStroke();
Remove the stroke from all children of the group.
*/
class Group extends Shape {

  constructor() {
    super(true);

    this.bound = {
      insertChildren: this.insertChildren.bind(this),
      removeChildren: this.removeChildren.bind(this),
      orderChildren: this.orderChildren.bind(this),
    };

    this._renderer.type = 'group';
    this.additions = [];
    this.subtractions = [];
    this.children = arguments;

  }

  // --------------------
  // Accessors
  // --------------------

  get children() {
    return this._children;
  }
  set children(children) {

    if (this._children) { this._children.dispatcher.off(); }
    this._children = new Children(children);
    this._children.dispatcher.on(CollectionEvent.insert, this.bound.insertChildren);
    this._children.dispatcher.on(CollectionEvent.remove, this.bound.removeChildren);
    this._children.dispatcher.on(CollectionEvent.order, this.bound.orderChildren);
  }

  get mask() {
    return this._mask;
  }
  set mask(v) {
    this._mask = v;
    this._flag_mask = true;
    if (!v.clip) {
      v.clip = true;
    }
  }

  // --------------------
  // Main
  // --------------------

  insertChildren(children) {
    for (var i = 0; i < children.length; i++) {
      groupFN.replaceParent(this, children[i], this);
    }
  }

  removeChildren(children) {
    for (var i = 0; i < children.length; i++) {
      groupFN.replaceParent(this, children[i]);
    }
  }

  orderChildren(children) {
    this._flag_order = true;
  }


  /**
   * Anchor all children to the upper left hand corner
   * of the group.
   */
  corner() {

    var rect = this.getBoundingClientRect(true),
        corner = { x: rect.left, y: rect.top };

    this.children.forEach(function(child) {
      child.translation.subSelf(corner);
    });

    return this;

  }

  /**
   * Anchors all children around the center of the group,
   * effectively placing the shape around the unit circle.
   */
   // :TODO: :WARN: remove this or at the very least, make it optional,
   // as it overwrites the user settings.
  center() {

    var rect = this.getBoundingClientRect(true);
    rect.centroid = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    this.children.forEach(function(child) {
      child.translation.subSelf(rect.centroid);
    });

    // this.translation.copy(rect.centroid);

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
   * Recursively search for classes. Returns an array of matching elements.
   * Empty array if none found.
   */
  getByClassName (cl) {
    return groupFN.findAllMembers(
      this, groupFN.nodeChildren,
      (node) => { return node.classList.indexOf(cl) !== -1; }
    );
  }

  /**
   * Recursively search for children of a specific type,
   * e.g. Two.Polygon. Pass a reference to this type as the param.
   * Returns an empty array if none found.
   */
  getByType(type) {
    return groupFN.findAllMembers(
      this, groupFN.nodeChildren,
      (node) => { return node instanceof type; }
    );
  }

  /**
   * Add objects to the group.
   */
  add(objects) {

    // Allow to pass multiple objects either as array or as multiple arguments
    // If it's an array also create copy of it in case we're getting passed
    // a childrens array directly.
    if (!(objects instanceof Array)) {
      objects = Array.from(arguments);
    } else {
      objects = objects.slice();
    }

    // Add the objects
    for (var i = 0; i < objects.length; i++) {
      if (!(objects[i] && objects[i].id)) continue;
      this.children.push(objects[i]);
    }

    return this;

  }

  /**
   * Remove objects from the group.
   */
  remove(objects) {

    var l = arguments.length,
      grandparent = this.parent;

    // Allow to call remove without arguments
    // This will detach the object from the scene.
    if (l <= 0 && grandparent) {
      grandparent.remove(this);
      return this;
    }

    // Allow to pass multiple objects either as array or as multiple arguments
    // If it's an array also create copy of it in case we're getting passed
    // a childrens array directly.
    if (!(objects instanceof Array)) {
      objects = Array.from(arguments);
    } else {
      objects = objects.slice();
    }

    // Remove the objects
    for (var i = 0; i < objects.length; i++) {
      if (!objects[i] || !(this.children.ids[objects[i].id])) continue;
      this.children.splice(this.children.indexOf(objects[i]), 1);
    }

    return this;

  }

  /**
   * Trickle down of noFill
   */
  noFill() {
    this.children.forEach(function(child) {
      child.noFill();
    });
    return this;
  }

  /**
   * Trickle down of noStroke
   */
  noStroke() {
    this.children.forEach(function(child) {
      child.noStroke();
    });
    return this;
  }

  /**
   * Trickle down subdivide
   */
  subdivide() {
    var args = arguments;
    this.children.forEach(function(child) {
      child.subdivide.apply(child, args);
    });
    return this;
  }

  // -----------------
  // IBounded
  // -----------------

  getBoundingClientRect(shallow) {
    // TODO: Update this to not __always__ update. Just when it needs to.
    this._update(true);
    return groupFN.getEnclosingRect({shallow, children: this.children});
  }

  // -----------------
  // IRenderable
  // -----------------


  flagReset() {

    if (this._flag_additions) {
      this.additions.length = 0;
      this._flag_additions = false;
    }

    if (this._flag_subtractions) {
      this.subtractions.length = 0;
      this._flag_subtractions = false;
    }

    this._flag_order = this._flag_mask = this._flag_opacity = false;

    Shape.prototype.flagReset.call(this);

    return this;

  }

  /**
   * TODO: Group has a gotcha in that it's at the moment required to be bound to
   * an instance of two in order to add elements correctly. This needs to
   * be rethought and fixed.
   */
  clone(parent) {

    parent = parent || this.parent;
    var clone = cloneProperties(this, new Group(), []);
    parent.add(clone);
    // now clone all children recursively
    var children = (this.children || []).map((child) => {
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
    obj.children =  (this.children || []).map((child) => {
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
