import _ from '../util/underscore';
import EventsDecorator   from '../util/eventsDecorator.js';
import EventTypes   from '../constant/EventTypes';

/**
 * Array like collection that triggers inserted and removed events
 * removed : pop / shift / splice
 * inserted : push / unshift / splice (with > 2 arguments)
 */

class Collection {

  constructor() {

    Array.call(this);

    if (arguments.length > 1) {
      Array.prototype.push.apply(this, arguments);
    } else if (arguments[0] && Array.isArray(arguments[0])) {
      Array.prototype.push.apply(this, arguments[0]);
    }

  }
}


Collection.prototype = new Array();
Collection.constructor = Collection;

_.extend(Collection.prototype, EventsDecorator, {

  pop: function() {
    var popped = Array.prototype.pop.apply(this, arguments);
    this.trigger(EventTypes.remove, [popped]);
    return popped;
  },

  shift: function() {
    var shifted = Array.prototype.shift.apply(this, arguments);
    this.trigger(EventTypes.remove, [shifted]);
    return shifted;
  },

  push: function() {
    var pushed = Array.prototype.push.apply(this, arguments);
    this.trigger(EventTypes.insert, arguments);
    return pushed;
  },

  unshift: function() {
    var unshifted = Array.prototype.unshift.apply(this, arguments);
    this.trigger(EventTypes.insert, arguments);
    return unshifted;
  },

  splice: function() {
    var spliced = Array.prototype.splice.apply(this, arguments);
    var inserted;

    this.trigger(EventTypes.remove, spliced);

    if (arguments.length > 2) {
      inserted = this.slice(arguments[0], arguments[0] + arguments.length - 2);
      this.trigger(EventTypes.insert, inserted);
      this.trigger(EventTypes.order);
    }
    return spliced;
  },

  sort: function() {
    Array.prototype.sort.apply(this, arguments);
    this.trigger(EventTypes.order);
    return this;
  },

  reverse: function() {
    Array.prototype.reverse.apply(this, arguments);
    this.trigger(EventTypes.order);
    return this;
  }

});

export default Collection;