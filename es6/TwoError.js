/* jshint esnext: true */

// Custom Error Throwing for Two.js

/**
 * A two.js specific custom error handler. Takes a message, string, to display
 * in the console to developers.
 */
class TwoError extends Error {
	constructor(message) {
		super(message);
		this.name = 'two.js';
		this.message = message;
	}

}

export default TwoError;
