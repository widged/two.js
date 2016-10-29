import _ from './common';
var slice = _.natural.slice;

class EventEmitter {
	constructor(eventTypes) {
		this.state = {}; 
		this.eventTypes = eventTypes;
	}

	on(uid, callback) {
	  var eventTypes = this.eventTypes;
      if(Array.isArray(eventTypes) && !eventTypes.includes(uid)) { return this; }
     //  Do not create events unless event listeners are explicity bound to it.
       if(!this.state.events) { this.state.events = {}; }
	    var list = this.state.events[uid] || (this.state.events[uid] = []);
	    list.push(callback);
	    return this;
	}

	off(uid, callback) {
      if(!this.state.events) { return this; }
      var events = this.state.events;
		if (!events) { return this; }
		if (!uid && !callback) {
			events = {};
			return this;
		} else if(!uid || !callback) {
			throw '[EventEmitter] off expects either no arguments or both a uid and callback need to be provided';
		} else {
		events[uid] = (events[uid] || []).filter((ev) => {
			return callback !== ev;
		});
		}
		return this;
	}

    emit(uid, ...data) {
      if(!this.state.events) { return this; }
	  var subscribers = this.state.events[uid];
	  if (subscribers) { trigger(this, subscribers, data) };
	  return this;
    }  
}

function trigger(obj, events, args) {
  var method;
  switch (args.length) {
  case 0:
    method = function(i) {
      events[i].call(obj, args[0]);
    };
    break;
  case 1:
    method = function(i) {
      events[i].call(obj, args[0], args[1]);
    };
    break;
  case 2:
    method = function(i) {
      events[i].call(obj, args[0], args[1], args[2]);
    };
    break;
  case 3:
    method = function(i) {
      events[i].call(obj, args[0], args[1], args[2], args[3]);
    };
    break;
  default:
    method = function(i) {
      events[i].apply(obj, args);
    };
  }
  for (var i = 0; i < events.length; i++) {
    method(i);
  }
}

export default EventEmitter;

