/* jshint esnext: true */

/**
 * A list of actionable events triggered by a given instance. For the most part
 * these are internal events in order to enable two-way databinding. Exceptions
 * include update event on animation loop and resize when the dimensions of the
 * drawing space change. Related to two.bind and two.trigger.
 */

export default {
	play: 'play',
	pause: 'pause',
	update: 'update',
	render: 'render',
	resize: 'resize',
	change: 'change'
};
