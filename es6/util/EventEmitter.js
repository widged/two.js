import _ from './underscore';
import EventsDecorator   from './eventsDecorator.js';

class Emitter {

	constructor(x, y) {

	  this.x = x || 0;
	  this.y = y || 0;

	}
}


_.extend(Emitter.prototype, EventsDecorator);


    
export default Emitter;