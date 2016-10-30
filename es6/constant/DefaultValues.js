/* jshint esnext: true */

import RendererTypes from './RendererTypes';

var FN = {};

// https://two.js.org/#documentation

/*
type params.type
Set the type of renderer for the instance: svg, webgl, canvas, etc.. Applicable types are carried within Two.Types. Default type is Two.Types.svg.

width params.width
Set the width of the drawing space. Disregarded if params.fullscreen is set to true. Default width is 640 pixels.

height params.height
Set the height of the drawing space. Disregarded if params.fullscreen is set to true. Default height is 480 pixels.

autostart params.autostart
A boolean to automatically add the instance to draw on requestAnimationFrame. This is a convenient substitute so you don't have to call two.play().

fullscreen params.fullscreen
A boolean to set the drawing space of the instance to be fullscreen or not. If set to true then width and height parameters will not be respected.

ratio params.ratio
Set the resolution ratio for canvas and webgl renderers. If left blank two.js automatically infers the ratio based on the devicePixelRatio api.
*/
FN.Two = {
  fullscreen: false,
  width: 640,
  height: 480,
  type: RendererTypes.svg,
  autostart: false
};




export default {
	remove: 'remove',
	insert: 'insert',
	order: 'order'
};
