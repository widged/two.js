/* jshint esnext: true */

/**
 * A list of actionable events triggered by a given instance. For the most part
 * these are internal events in order to enable two-way databinding. Exceptions
 * include update event on animation loop and resize when the dimensions of the
 * drawing space change. Related to two.dispatcher
 */

export default {
	playing: 'playing',
	paused: 'paused',
	tick: 'tick',
};
