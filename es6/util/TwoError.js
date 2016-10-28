// Custom Error Throwing for Two.js

class TwoError extends Error {
	constructor(message) {
		this.name = 'two.js';
		this.message = message;
	}

}

export default TwoError;