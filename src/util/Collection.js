'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscore = require('./underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _eventsDecoratorJs = require('./eventsDecorator.js');

var _eventsDecoratorJs2 = _interopRequireDefault(_eventsDecoratorJs);

var _constantEventTypes = require('../constant/EventTypes');

var _constantEventTypes2 = _interopRequireDefault(_constantEventTypes);

/**
 * Array like collection that triggers inserted and removed events
 * removed : pop / shift / splice
 * inserted : push / unshift / splice (with > 2 arguments)
 */
function Collection() {

  Array.call(this);

  if (arguments.length > 1) {
    Array.prototype.push.apply(this, arguments);
  } else if (arguments[0] && Array.isArray(arguments[0])) {
    Array.prototype.push.apply(this, arguments[0]);
  }
}

Collection.prototype = new Array();
Collection.constructor = Collection;

_underscore2['default'].extend(Collection.prototype, _eventsDecoratorJs2['default'], {

  pop: function pop() {
    var popped = Array.prototype.pop.apply(this, arguments);
    this.trigger(_constantEventTypes2['default'].remove, [popped]);
    return popped;
  },

  shift: function shift() {
    var shifted = Array.prototype.shift.apply(this, arguments);
    this.trigger(_constantEventTypes2['default'].remove, [shifted]);
    return shifted;
  },

  push: function push() {
    var pushed = Array.prototype.push.apply(this, arguments);
    this.trigger(_constantEventTypes2['default'].insert, arguments);
    return pushed;
  },

  unshift: function unshift() {
    var unshifted = Array.prototype.unshift.apply(this, arguments);
    this.trigger(_constantEventTypes2['default'].insert, arguments);
    return unshifted;
  },

  splice: function splice() {
    var spliced = Array.prototype.splice.apply(this, arguments);
    var inserted;

    this.trigger(_constantEventTypes2['default'].remove, spliced);

    if (arguments.length > 2) {
      inserted = this.slice(arguments[0], arguments[0] + arguments.length - 2);
      this.trigger(_constantEventTypes2['default'].insert, inserted);
      this.trigger(_constantEventTypes2['default'].order);
    }
    return spliced;
  },

  sort: function sort() {
    Array.prototype.sort.apply(this, arguments);
    this.trigger(_constantEventTypes2['default'].order);
    return this;
  },

  reverse: function reverse() {
    Array.prototype.reverse.apply(this, arguments);
    this.trigger(_constantEventTypes2['default'].order);
    return this;
  }

});

exports['default'] = Collection;
module.exports = exports['default'];