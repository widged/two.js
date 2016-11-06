/* jshint esnext: true */

/**
 * A list of commands that dictate how a renderer draw Anchors.
 * A more detailed description of commands can be found on the w3c.
 * https://www.w3.org/TR/SVG2/paths.html#PathData
 */
export default {
	MOVE: 'M',
	LINE: 'L',
	CURVE: 'C',
	CLOSE: 'Z'
};
