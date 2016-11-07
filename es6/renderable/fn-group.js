/* jshint esnext: true */

import is  from '../lib/is/is';
import rectFN  from '../lib/struct-bounding-rect/bounding-rect-fn';

var {isNumber} = is;
var {getEnclosingRect} = rectFN;

var FN = {};
var NotInUse = {};


FN.isShape = (object) => {
  return (object && object.id) ? true : false;
};

FN.addShapesToList = (shapes, childrenColl) => {
  var {isShape} = FN;
  if(!childrenColl.addItem) { throw "[GroupFN.addShapesTochidren] case not covered"; }
  for (var i = 0, ni = shapes.length, shp = null; i < ni; i++) {
    shp = shapes[i];
    if (isShape(shp)) { childrenColl.addItem(shp); }
  }
  return childrenColl;
};

FN.removeShapesFromChildren = (objects, childrenColl) => {
  for (var i = 0, ni = objects.length, obj = null; i < ni; i++) {
    obj = objects[i];
    if (!obj || !(childrenColl.ids[obj.id])) continue;
    // :REVIEW: Any chance it could be optimised if childrenColl was organised as a dictionary with ks and vs?
    var idx = childrenColl.indexOf(obj);
    if(idx === -1) { throw "[GroupFN.removeShapesFromChildren] case not covered"; }
    childrenColl.splice(childrenColl.indexOf(obj), 1);
  }
};

FN.adoptShapes = (group, shapes) => {
  var {replaceParent} = FN;

  if(group.childrenColl) {
    var {ids, items} = group.childrenColl;
    if(!ids) { ids = group.ids = {}; }
    for (var i = 0; i < items.length; i++) {
      ids[items[i].id] = items[i];
    }
  }
  for (var i = 0; i < shapes.length; i++) {
    replaceParent(group, shapes[i], group);
  }
};

FN.dropShapes = (group, shapes) => {
  var {replaceParent} = FN;

  if(group.childrenColl) {
    var {ids, items} = group.childrenColl;
    if(!ids) { ids = group.ids = {}; }
    for (var i = 0; i < items.length; i++) {
      delete ids[items[i].id];
    }
    return ids;
  }

  for (var i = 0; i < shapes.length; i++) {
    replaceParent(group, shapes[i]);
  }
};

// If no objects are specified, remove the group from the scene.
FN.removeGroupFromParent = (group, parent) => {
  if(!parent) { return parent; }
  if(typeof parent.remove !== 'function') { return parent; }
  parent.remove(group);
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
FN.replaceParent = (that, child, newParent) => {

  var parent = child.parent;
  var index;

  var {additions, substractions, changeTracker} = that.getState();
  if (parent === newParent) {
    var {changeTracker: parentTracker} = parent.getState();
    additions.push(child);
    parentTracker.raise(['additions']);
    return;
  }

  var {childrenColl:parentChildren} = that.getProps();
  if(!parentChildren.ids)    { parentChildren.ids = {}; }
  if (parent && parentChildren.ids[child.id]) {

    var {additions: parentAdditions, substractions: parentSubstrations} = parent.getState();
    var {changeTracker: parentTracker} = parent.getState();


    index = (Array.from(parentChildren) || []).indexOf(child);
    parentChildren.splice(index, 1);

    // If we're passing from one parent to another...
    index = parentAdditions.indexOf(child);

    if (index >= 0) {
      parentAdditions.splice(index, 1);
    } else {
      parentSubstrations.push(child);
      parentTracker.raise(['substractions']);
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




FN.translateChildren = (childrenColl, translate) => {
  var rect = getEnclosingRect({shallow: true, childrenColl});
  childrenColl.forEach(function(child) {
    child.translation.subSelf(translate(rect));
  });
  return childrenColl;
};

FN.getItemWithId = (group, id) => {
  var {findFirstMember, nodeChildren} = FN;
  return findFirstMember(
    group, nodeChildren,
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
 * Recursively search for `children` of a specific type,
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
