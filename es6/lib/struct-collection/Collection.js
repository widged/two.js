/* jshint esnext: true */

import EventEmitter    from '../event-emitter/EventEmitter';
import CollectionEventTypes from './CollectionEventTypes';

/**
 * Array like collection that triggers inserted and removed events
 * removed : pop / shift / splice
 * inserted : push / unshift / splice (with > 2 arguments)
 * e.g: used for `anchors` attribute of a Path.
 */
class Collection  {

  constructor(arr) {
    this.dispatcher = new EventEmitter(Object.keys(CollectionEventTypes));
    this.state = {items: arr};

  }

  get length() {
    return this.items.length;
  }
  set length(_) {
    // console.trace();
    // this.items.length = _;
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

/*
  pop() {
    var items = this.items;
    var removed = this.items.pop();
    this.whenItemsRemoved([removed]);
    return removed;
  }
  */

/*
  shift() {
    var items = this.items;
    var removed = this.items.shift();
    this.whenItemsRemoved([removed]);
    return removed;
  }
*/

/*
  unshift(...args) {
    var items = this.items;
    var added = this.items.unshift(...args);
    this.whenItemsAdded([added]);
    return added;
  }
*/

  addItem(d) {
    var items = this.items;
    var added = items.push(d);
    this.item = items;
    this.whenItemsAdded([d]);
    return added;
  }

  splice(...args) {
    var items = this.items;
    var spliced = items.splice(...args);
    this.item = items;
    this.whenItemsRemoved(spliced)

    var inserted;
    if (args.length > 2) {
      inserted = this.slice(args[0], args[0] + args.length - 2);
      this.whenItemsAdded(inserted);
      this.whenItemsReordered();
    }
    return spliced;
  }


  sort(...args) {
    var items = this.items;
    items.sort(...args);
    this.items = items;
    this.whenItemsReordered();
    return this;
  }

  reverse() {
    var items = this.items;
    items.reverse();
    this.items = items;
    this.whenItemsReordered();
    return this;
  }


  /*




    */

}



export default Collection;
