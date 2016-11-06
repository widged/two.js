/* jshint esnext: true */

import EventEmitter    from '../util/EventEmitter';
import CollectionEventTypes from '../constant/CollectionEventTypes';

/**
 * Array like collection that triggers inserted and removed events
 * removed : pop / shift / splice
 * inserted : push / unshift / splice (with > 2 arguments)
 * e.g: used for vertices attribute of a Path.
 */
class Collection  {

  constructor() {
    this.dispatcher = new EventEmitter(Object.keys(CollectionEventTypes));
    this.state = {items: []};

    if (arguments.length > 1) {
      Array.prototype.push.apply(this, arguments);
    } else if (arguments[0] && Array.isArray(arguments[0])) {
      Array.prototype.push.apply(this, arguments[0]);
    }
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

  pop() {
    var popped = Array.prototype.pop.apply(this, arguments);
    this.whenItemsRemoved([popped]);
    return popped;
  }

  shift() {
    var shifted = Array.prototype.shift.apply(this, arguments);
    this.whenItemsRemoved([shifted]);
    return shifted;
  }

  push() {
    var pushed = Array.prototype.push.apply(this, arguments);
    this.whenItemsAdded(arguments)
    return pushed;
  }

  unshift() {
    var unshifted = Array.prototype.unshift.apply(this, arguments);
    this.whenItemsAdded(arguments);
    return unshifted;
  }

  splice() {
    var spliced = Array.prototype.splice.apply(this, arguments);
    var inserted;

    this.whenItemsRemoved(spliced)

    if (arguments.length > 2) {
      inserted = this.slice(arguments[0], arguments[0] + arguments.length - 2);
      this.whenItemsAdded(inserted);
      this.whenItemsReordered();
    }
    return spliced;
  }

  sort() {
    Array.prototype.sort.apply(this, arguments);
    this.whenItemsReordered();
    return this;
  }

  reverse() {
    Array.prototype.reverse.apply(this, arguments);
    this.whenItemsReordered();
    return this;
  }
}



export default Collection;
