// Custom Error Throwing for Two.js

function TwoError(message) {
this.name = 'two.js';
this.message = message;
}

TwoError.prototype = new Error();
TwoError.prototype.constructor = TwoError;

export default TwoError;