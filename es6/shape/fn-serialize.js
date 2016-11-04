/* jshint esnext: true */

import is  from '../util/is';

var {isNumber} = is;

var FN = {};
var NotInUse = {};


FN.isShape = (object) => {
  return (object && object.id) ? true : false;
};

FN.addShapesToChildren = (objects, children) => {
  var {isShape} = FN;
  if(children.constructor.name !== 'ChildrenCollection') { throw "[GroupFN.addShapesTochidren] case not covered"; }
  for (var i = 0, ni = objects.length, obj = null; i < ni; i++) {
    obj = objects[i];
    if (isShape(obj)) { children.push(obj); }
  }
  return children;
};

FN.removeShapesFromChildren = (objects, children) => {
  for (var i = 0, ni = objects.length, obj = null; i < ni; i++) {
    obj = objects[i];
    if (!obj || !(children.ids[obj.id])) continue;
    // :NOTE: this could be optimised if children was organised as a dictionary with ks and vs.
    var idx = children.indexOf(obj);
    if(idx === -1) { throw "[GroupFN.removeShapesFromChildren] case not covered"; }
    children.splice(children.indexOf(obj), 1);
  }
};



FN.adoptShapes = (group, shapes) => {
  var {replaceParent} = FN;
  for (var i = 0; i < shapes.length; i++) {
    replaceParent(group, shapes[i], group);
  }
};

FN.dropShapes = (group, shapes) => {
  var {replaceParent} = FN;
  for (var i = 0; i < shapes.length; i++) {
    replaceParent(group, shapes[i]);
  }
};


// If no objects are specified, remove the group from the scene.
FN.removeGroupFromParent = (group, parent) => {
  if(!parent) { return parent; }
  if(typeof parent.remove !== 'function') { return parent; }
  parent.remove(this);
  return parent;
};

/**
 * Helper function used to sync parent-child relationship within the
 * `Group.children` object.
 *
 * Set the parent of the passed object to another object
 * and updates parent-child relationships
 * Calling with one arguments will simply remove the parenting
 */
FN.replaceParent = (shp, child, newParent) => {

  var {parent} = child.getState();

  var index;

  var {additions, substractions, changeTracker} = shp.getState();

  if (parent === newParent) {
    additions.push(child);
    var {changeTracker: parentTracker} = this.getState();
    parentTracker.raise(['additions']);
    return;
  }



  if (parent)
    var {
      children: parentChildren,
      additions: parentAdditions,
      substractions, parentSubstractions,
      changeTracker: parentTracker
    } = parent.getState();

    if(parentChildren.ids[child.id]) {

      index = (Array.from(parentChildren) || []).indexOf(child);
      parentChildren.splice(index, 1);

      // If we're passing from one parent to another...
      index = parentAdditions.indexOf(child);

      if (index >= 0) {
        parentAdditions.splice(index, 1);
      } else {
        parentSubstractions.push(child);
        parentTracker.raise(['substractions']);
      }
    }
  }

  if (newParent) {
    child.parent = newParent;
    additions.push(child);
    changeTracker.raise(['additions']);
    return;
  }

  // If we're passing from one parent to another...
  index = additions.indexOf(child);

  if (index >= 0) {
    additions.splice(index, 1);
  } else {
    substractions.push(child);
    changeTracker.raise(['substractions']);
  }

  delete child.parent;

};


/**
 * Return an object with top, left, right, bottom, width, and height
 * parameters of the group.
 */
FN.getEnclosingRect = ({shallow, children}) => {
  var rect;
  var min = Math.min, max = Math.max;

  // Variables need to be defined here, because of nested nature of groups.
  var left = Infinity, right = -Infinity,
      top = Infinity, bottom = -Infinity;

  for(var i = 0, ni = children.length, child = {}; i < ni; i++ ) {
    child = children[i];
    if (/(linear-gradient|radial-gradient|gradient)/.test(child.rendererType)) {
      return;
    }
    // :NOTE: before refactoring this, consider that child.getBoundingClientRect
    // will call shp.update() before computing the rectangle.
    rect = child.getBoundingClientRect(shallow);

    if (!isNumber(rect.top)   || !isNumber(rect.left)   ||
        !isNumber(rect.right) || !isNumber(rect.bottom)) {
      return;
    }

    top = min(rect.top, top);
    left = min(rect.left, left);
    right = max(rect.right, right);
    bottom = max(rect.bottom, bottom);

  }

  return {
    top: top,
    left: left,
    right: right,
    bottom: bottom,
    width: right - left,
    height: bottom - top
  };

};

FN.translateChildren = (children, translate) => {
  var {getEnclosingRect} = FN;
  var rect = getEnclosingRect({shallow: true, children});
  children.forEach(function(child) {
    child.translation.subSelf(translate(rect));
  });
  return children;
};

FN.getItemWithId = (group, id) => {
  var {findFirstMember, nodeChildren} = FN;
  return findFirstMember(
    this, nodeChildren,
    (node) => { return node.id === id; }
  );
};

/**
 * Recursively search for classes. Returns an array of matching elements.
 * Empty array if none found.
 */
NotInUse.listItemsWithClassName = (group, cl) => {
  var {findAllMembers, nodeChildren} = FN;
  return findAllMembers(
    group, nodeChildren,
    (node) => { return node.classList.indexOf(cl) !== -1; }
  );
};

/**
 * Recursively search for children of a specific type,
 * e.g. Two.Polygon. Pass a reference to this type as the param.
 * Returns an empty array if none found.
 */
NotInUse.listItemsWithType =  (group, type) => {
  var {findAllMembers, nodeChildren} = FN;
  return findAllMembers(
    group, nodeChildren,
    (node) => { return node instanceof type; }
  );
};

/**
 * Recursively search for id. Returns the first element found.
 * Returns null if none found.
 */
FN.findFirstMember = (item, getMembers, assert) => {
  var {findAllMembers} = FN;
  var list = findAllMembers(item, getMembers, assert, {stopOnFirstMatch: true});
  return list[0] || null;
};


FN.findAllMembers = (item, getMembers, assert, config) => {
  var {stopOnFirstMatch} = config || {};
  var recurse = (item, found) => {
    if (assert(item)) { found.push(item); }
    if(!stopOnFirstMatch) {
      var members = getMembers(item);
      if (members) {
        var i = members.length;
        while (i--) { recurse(members[i], found); }
      }
    }
    return found;
  };
  var list = recurse(item, []);
};


export default FN;
