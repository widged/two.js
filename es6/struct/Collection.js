import _ from '../util/common';
import Emitter    from '../util/EventEmitter';
import EventTypes from '../constant/EventTypes';

/**
 * Array like collection that triggers inserted and removed events
 * removed : pop / shift / splice
 * inserted : push / unshift / splice (with > 2 arguments)
 */
class Collection extends Emitter  {

  constructor() {
    super();

    this.state = {arr: []};

    if (arguments.length > 1) {
      Array.prototype.push.apply(this, arguments);
    } else if (arguments[0] && Array.isArray(arguments[0])) {
      Array.prototype.push.apply(this, arguments[0]);
    }
  }

  emit(eventType, data) {
    var types = {removed: EventTypes.remove, inserted: EventTypes.insert, reordered: EventTypes.order};
    var evenType = types[eventType] || eventType;
    super.emit(eventType, data);
  }  

  pop() {
    var popped = Array.prototype.pop.apply(this, arguments);
    this.emit(EventTypes.remove, [popped]);
    return popped;
  }  

  shift() {
    var shifted = Array.prototype.shift.apply(this, arguments);
    this.emit(EventTypes.remove, [shifted]);
    return shifted;
  }

  push() {
    var pushed = Array.prototype.push.apply(this, arguments);
    this.emit(EventTypes.insert, arguments);
    return pushed;
  }  

  unshift() {
    var unshifted = Array.prototype.unshift.apply(this, arguments);
    this.emit(EventTypes.insert, arguments);
    return unshifted;
  }

  splice() {
    var spliced = Array.prototype.splice.apply(this, arguments);
    var inserted;

    this.emit(EventTypes.remove, spliced);

    if (arguments.length > 2) {
      inserted = this.slice(arguments[0], arguments[0] + arguments.length - 2);
      this.emit(EventTypes.insert, inserted);
      this.emit(EventTypes.order);
    }
    return spliced;
  }

  sort() {
    Array.prototype.sort.apply(this, arguments);
    this.emit(EventTypes.order);
    return this;
  }

  reverse() {
    Array.prototype.reverse.apply(this, arguments);
    this.emit(EventTypes.order);
    return this;
  }
}



// _.extend(Collection.prototype, EventsDecorator);



export default Collection;