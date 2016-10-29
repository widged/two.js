import Collection  from '../struct/Collection';
import is  from '../util/is';
import _  from '../util/common';
import CollectionEvent   from '../constant/CollectionEvent';

/**
 * A children collection which is accesible both by index and by object id
 * @constructor
 */
class Children extends Collection {

  constructor(children) {

    super(children);

    this.ids = {};

    this.dispatcher.on(CollectionEvent.insert, (children) => {
      attachChildren(children, this.ids);
    });
    this.dispatcher.on(CollectionEvent.remove, (children) => {
      detachChildren(children, this.ids)
    });
    attachChildren(children, this.ids);
  }
}
  
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

export default Children;