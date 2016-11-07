/* jshint esnext: true */

import EventEmitter    from '../event-emitter/EventEmitter';
import CollectionEventTypes from './CollectionEventTypes';

/**
 * Array like collection that triggers inserted and removed events
 * removed : pop / shift / splice
 * inserted : push / unshift / splice (with > 2 arguments)
 * e.g: used for anchorColl attribute of a Path.
 */
class CollectionArray  {

  constructor(arr) {
    this.dispatcher = new EventEmitter(Object.keys(CollectionEventTypes));
    this.state = {items: arr};
    if (arguments.length > 1) {
      Array.prototype.push.apply(this, arguments);
    } else if (arguments[0] && Array.isArray(arguments[0])) {
      Array.prototype.push.apply(this, arguments[0]);
    }
  }

  get items() {
    return this.state.items || [];
  }
  set items(_) {
    if(!Array.isArray(_)) { _ = []; }
    this.state.items = _;
  }

  whenItemsRemoved(items) {
    this.dispatcher.emit(CollectionEventTypes.remove, items);
  }
  whenItemsAdded(items) {
    this.dispatcher.emit(CollectionEventTypes.insert, items);
  }
  whenItemsReordered(items) {
    this.dispatcher.emit(CollectionEventTypes.order);
  }

  addItem(d) {
    Array.prototype.push.apply(this, [d]);
    var items = this.items;
    var added = items.push(d);
    this.items = items;
    this.whenItemsAdded([d]);
    return added;
  }


}



export default CollectionArray;
