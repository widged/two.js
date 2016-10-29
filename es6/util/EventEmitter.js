import _ from './common';
import EventsDecorator   from './emitter-decorator';

class Emitter {
	constructor() {
	}
}


_.extend(Emitter.prototype, EventsDecorator);


    
export default Emitter;