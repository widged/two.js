/* jshint esnext: true */

// Custom Error Throwing for Two.js

class TwoError extends Error {
	constructor(message) {
		super(message);
		this.name = 'two.js';
		this.message = message;
	}

}

export default TwoError;
