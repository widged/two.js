import Collection  from '../struct/Collection';
import is  from '../util/is';
import _  from '../util/underscore';
import EventTypes   from '../constant/EventTypes';


var attachChildren = (children, ids) => {
  for (var i = 0; i < children.length; i++) {
    ids[children[i].id] = children[i];
  }
  return ids;
}
var detachChildren = (children, ids) => {
  for (var i = 0; i < children.length; i++) {
      delete ids[children[i].id];
    }
    return ids;
}

/**
   * A children collection which is accesible both by index and by object id
   * @constructor
   */
  class Children extends Collection {

    constructor(children) {

      super(...children);

      Object.defineProperty(this, '_events', {
        value : {},
        enumerable: false
      });

      this.ids = {};

      // this.on(EventTypes.insert, this.attach);
      // this.on(EventTypes.remove, this.detach);
      attachChildren(children, this.ids);
      // this.attach(children);
    }

    attach(children) {
      this.ids = attachChildren(children, this.ids);
      return this;
    }

    detach(children) {
      this.ids = detachChildren(children, this.ids);
      return this;
    }

  }
  
Children.prototype = new Collection();

export default Children;