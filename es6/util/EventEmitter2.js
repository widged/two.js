import EventEmitter   from '../util/EventEmitter.js';
import EventTypes   from '../constant/EventTypes';

class EventEmitter2 {

	constructor() {
		this.emitter = undefined;
	}

	on(uid, callback) {
	  if(!this.emitter) { this.emitter = new EventEmitter(); };
	  this.emitter.on(uid, callback)
	}

	off(uid, callback) {
	  if(!this.emitter) { return; };
	  this.emitter.off(uid, callback)
	}

    emit(eventType, data) {
      if(!this.emitter) { return; }
      this.emitter.trigger(eventType, data)
    }  
}

export default EventEmitter2;