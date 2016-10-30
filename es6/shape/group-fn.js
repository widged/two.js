/* jshint esnext: true */

import is  from '../util/is';

var {isNumber} = is;

var FN = {};

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

  if (parent === newParent) {
    that.additions.push(child);
    that._flag_additions = true;
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
      parent._flag_subtractions = true;
    }
  }

  if (newParent) {
    child.parent = newParent;
    that.additions.push(child);
    that._flag_additions = true;
    return;
  }

  // If we're passing from one parent to another...
  index = that.additions.indexOf(child);

  if (index >= 0) {
    that.additions.splice(index, 1);
  } else {
    that.subtractions.push(child);
    that._flag_subtractions = true;
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

/**
 * Recursively search for id. Returns the first element found.
 * Returns null if none found.
 */
FN.findFirstMember = (item, getMembers, assert) => {
  var list = FN.findAllMembers = (item, getMembers, assert, {stopOnFirstMatch: true});
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
