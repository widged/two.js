/* jshint esnext: true */

import CollectionEvent   from '../constant/CollectionEvent';
import _  from '../util/common';
import is  from '../util/is';
import Path  from './Path';
import Shape  from '../Shape';
import Children  from '../ChildrenCollection';

var {isNumber, isArray} = is;
var {exclude}  = _;

// Flags
// http://en.wikipedia.org/wiki/Flag
const FLAG_DEFAULTS = {
  _flagAdditions: false,
  _flagSubtractions: false,
  _flagOrder: false,
  _flagOpacity: true,
  _flagMask: false,

};

// Underlying Properties
const PROP_DEFAULTS = {
  _fill: '#fff',
  _stroke: '#000',
  _linewidth: 1.0,
  _opacity: 1.0,
  _visible: true,
  _cap: 'round',
  _join: 'round',
  _miter: 4,
  _closed: true,
  _curved: false,
  _automatic: true,
  _beginning: 0,
  _ending: 1.0,
  _mask: null
};



class Group extends Shape {

  // --------------------
  // Constructor
  // --------------------

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
    this._flagMask = true;
    if (!v.clip) {
      v.clip = true;
    }
  }


  // --------------------
  // Main
  // --------------------

  insertChildren(children) {
    for (var i = 0; i < children.length; i++) {
      replaceParent(this, children[i], this);
    }
  }

  removeChildren(children) {
    for (var i = 0; i < children.length; i++) {
      replaceParent(this, children[i]);
    }
  }

  orderChildren(children) {
    this._flagOrder = true;
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
    var search = function (node, id) {
      if (node.id === id) {
        return node;
      } else if (node.children) {
        var i = node.children.length;
        while (i--) {
          var found = search(node.children[i], id);
          if (found) return found;
        }
      }

    };
    return search(this, id) || null;
  }

  /**
   * Recursively search for classes. Returns an array of matching elements.
   * Empty array if none found.
   */
  getByClassName (cl) {
    var found = [];
    var search = function (node, cl) {
      if (node.classList.indexOf(cl) != -1) {
        found.push(node);
      } else if (node.children) {
        node.children.forEach(function (child) {
          search(child, cl);
        });
      }
      return found;
    };
    return search(this, cl);
  }

  /**
   * Recursively search for children of a specific type,
   * e.g. Two.Polygon. Pass a reference to this type as the param.
   * Returns an empty array if none found.
   */
  getByType(type) {
    var found = [];
    var search = function (node, type) {
      for (var id in node.children) {
        if (node.children[id] instanceof type) {
          found.push(node.children[id]);
        } else if (node.children[id] instanceof Group) {
          search(node.children[id], type);
        }
      }
      return found;
    };
    return search(this, type);
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
   * Return an object with top, left, right, bottom, width, and height
   * parameters of the group.
   */
  getBoundingClientRect(shallow) {
    var rect;
    var min = Math.min, max = Math.max;


    // TODO: Update this to not __always__ update. Just when it needs to.
    this._update(true);

    // Variables need to be defined here, because of nested nature of groups.
    var left = Infinity, right = -Infinity,
        top = Infinity, bottom = -Infinity;

    this.children.forEach(function(child) {

      if (/(linear-gradient|radial-gradient|gradient)/.test(child._renderer.type)) {
        return;
      }

      rect = child.getBoundingClientRect(shallow);

      if (!isNumber(rect.top)   || !isNumber(rect.left)   ||
          !isNumber(rect.right) || !isNumber(rect.bottom)) {
        return;
      }

      top = min(rect.top, top);
      left = min(rect.left, left);
      right = max(rect.right, right);
      bottom = max(rect.bottom, bottom);

    }, this);

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

  flagReset() {

    if (this._flagAdditions) {
      this.additions.length = 0;
      this._flagAdditions = false;
    }

    if (this._flagSubtractions) {
      this.subtractions.length = 0;
      this._flagSubtractions = false;
    }

    this._flagOrder = this._flagMask = this._flagOpacity = false;

    Shape.prototype.flagReset.call(this);

    return this;

  }

// --------------------
// Utils
// --------------------

  /**
   * TODO: Group has a gotcha in that it's at the moment required to be bound to
   * an instance of two in order to add elements correctly. This needs to
   * be rethought and fixed.
   */
  clone(parent) {

    parent = parent || this.parent;

    var group = new Group();
    parent.add(group);

    var children = (this.children || []).map((child) => {
      return child.clone(group);
    });

    group.translation.copy(this.translation);
    group.rotation = this.rotation;
    group.scale = this.scale;

    return group;

  }

  /**
   * Export the data from the instance of Group into a plain JavaScript
   * object. This also makes all children plain JavaScript objects. Great
   * for turning into JSON and storing in a database.
   */
  toObject() {

    var result = {
      children: {},
      translation: this.translation.toObject(),
      rotation: this.rotation,
      scale: this.scale
    };

    _.each(this.children, function(child, i) {
      result.children[i] = child.toObject();
    }, this);

    return result;

  }
}

Group.Children = Children;

var props = Object.keys(PROP_DEFAULTS);
_.defineStyleAccessors(Group.prototype, props.filter(exclude(['opacity']))) ;
_.defineFlaggedAccessors(Group.prototype, ['opacity'], false) ;
Object.defineProperty(Group.prototype, 'children', {enumerable: true});
Object.defineProperty(Group.prototype, 'mask',     {enumerable: true});
Object.defineProperty(Group.prototype, 'opacity', {enumerable: true});
Object.keys(FLAG_DEFAULTS).forEach((k) => { Group.prototype[k] = FLAG_DEFAULTS[k]; });
Object.keys(PROP_DEFAULTS).forEach((k) => { Group.prototype[k] = PROP_DEFAULTS[k]; });

/**
 * Helper function used to sync parent-child relationship within the
 * `Group.children` object.
 *
 * Set the parent of the passed object to another object
 * and updates parent-child relationships
 * Calling with one arguments will simply remove the parenting
 */
var replaceParent = (that, child, newParent) => {

  var parent = child.parent;
  var index;

  if (parent === newParent) {
    that.additions.push(child);
    that._flagAdditions = true;
    return;
  }

  if (parent && parent.children.ids[child.id]) {

    index = (Array.from(parent.children) || []).indexOf(child);
    parent.children.splice(index, 1);

    // If we're passing from one parent to another...
    index = parent.additions.indexOf(child);

    if (index >= 0) {
      parent.additions.splice(index, 1);
    } else {
      parent.subtractions.push(child);
      parent._flagSubtractions = true;
    }
  }

  if (newParent) {
    child.parent = newParent;
    that.additions.push(child);
    that._flagAdditions = true;
    return;
  }

  // If we're passing from one parent to another...
  index = that.additions.indexOf(child);

  if (index >= 0) {
    that.additions.splice(index, 1);
  } else {
    that.subtractions.push(child);
    that._flagSubtractions = true;
  }

  delete child.parent;

};

export default Group;
