import _ from './common';
import EventsDecorator   from './emitter-decorator.js';

class Emitter {

	constructor(x, y) {

	  this.x = x || 0;
	  this.y = y || 0;

	}
}


_.extend(Emitter.prototype, EventsDecorator);


    
export default Emitter;