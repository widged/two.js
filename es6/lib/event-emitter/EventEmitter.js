/* jshint esnext: true */

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
	  	if (subscribers) {
				for (var i = 0, ni = subscribers.length; i < ni; i++) {
			    subscribers[i].apply(this, data);
				}
			}
	  	return this;
    }
}

export default EventEmitter;
