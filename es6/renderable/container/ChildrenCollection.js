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
    this.items = this;
    // this.children = this;

    this.dispatcher.on(CollectionEventTypes.insert, this.attachChildren.bind(this));
    this.dispatcher.on(CollectionEventTypes.remove, this.detachChildren.bind(this));
    this.attachChildren();
  }

  // --------------------
  // Main
  // --------------------

  get children() {
    console.trace()
    console.log('xxxx')
  }

  attachChildren()  {
    var {ids, items} = this;
    for (var i = 0; i < items.length; i++) {
      ids[items[i].id] = items[i];
    }
    return ids;
  }
  detachChildren() {
    var {ids, items} = this;
    for (var i = 0; i < items.length; i++) {
        delete ids[items[i].id];
      }
      return ids;
  }

}



export default ChildrenCollection;
