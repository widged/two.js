/* jshint esnext: true */

import IMPORTS from '../_imports';

var {CollectionArray, CollectionEventTypes} = IMPORTS;


/**
 * A `ChildrenCollection` which is accesible both by index and by object id
 * @constructor
 */
class ChildrenCollection extends CollectionArray {

  // --------------------
  // Constructor
  // --------------------

  constructor(arr) {

    super(arr);

    this.ids = {};
    this.children = this;

    this.dispatcher.on(CollectionEventTypes.insert, this.attachChildren.bind(this));
    this.dispatcher.on(CollectionEventTypes.remove, this.detachChildren.bind(this));
    this.attachChildren();
  }

  // --------------------
  // Main
  // --------------------

  attachChildren()  {
    var {ids, children} = this;
    for (var i = 0; i < children.length; i++) {
      ids[children[i].id] = children[i];
    }
    return ids;
  }
  detachChildren() {
    var {ids, children} = this;
    for (var i = 0; i < children.length; i++) {
        delete ids[children[i].id];
      }
      return ids;
  }

}



export default ChildrenCollection;
