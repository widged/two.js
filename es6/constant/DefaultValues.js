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

/*
rotation
A number that represents the rotation of the path in the drawing space, in radians.

scale
A `number` that represents the uniform scale of the path in the drawing space.

translation
A `Vector` that represents x, y translation of the path in the drawing space.

clip path.clip
A `boolean` describing whether to render this shape as a clipping mask.
This property is set automatically in correspondence with Two.Group.mask. Defaults to false.
*/
FN.Shape = {
  rotation: 0,
  scale: 1,
  clip: false
  // _translation
  // _mask: null,
};

/*
stroke group.stroke
A string representing the color for the stroke of all child shapes. Use strictly for setting. All valid css representations of color are accepted.

fill group.fill
A string representing the color for the area of all child shapes. Use strictly for setting. All valid css representations of color are accepted.

linewidth group.linewidth
A number representing the thickness of all child shapes' strokes. Use strictly for setting. Must be a positive number.

opacity group.opacity
A number representing the opacity of all child shapes. Use strictly for setting. Must be a number 0-1.

cap group.cap
A string representing the type of stroke cap to render for all child shapes. Use strictly for setting. All applicable values can be found on the w3c spec. Defaults to "round".

join group.join
A string representing the type of stroke join to render for all child shapes. Use strictly for setting. All applicable values can be found on the w3c spec. Defaults to "round".

miter group.miter
A number representing the miter limit for the stroke of all child objects. Use strictly for setting. Defaults to 1.
*/
FN.Group = {
   fill: '#fff',
   stroke: '#000',
   linewidth: 1.0,
   opacity: 1.0,
   visible: true,
   cap: 'round',
   join: 'round',
   miter: 4,
   closed: true,
   curved: false,
   automatic: true,
   beginning: 0,
   ending: 1.0,

   mask: null
 };
 // rotation, translation, scale, mask from Shape


/*
stroke path.stroke
A string representing the color for the stroke of the path. All valid css representations of color are accepted.

fill path.fill
A string representing the color for the area of the vertices. All valid css representations of color are accepted.

linewidth path.linewidth
A number representing the thickness the path's strokes. Must be a positive number.

opacity path.opacity
A number representing the opacity of the path. Use strictly for setting. Must be a number 0-1.

cap path.cap
A string representing the type of stroke cap to render. All applicable values can be found on the w3c spec. Defaults to "round".

join path.join
A string representing the type of stroke join to render. All applicable values can be found on the w3c spec. Defaults to "round".

miter path.miter
A number representing the miter limit for the stroke. Defaults to 1.
*/
FN.Path = {
  fill: '#fff',
  stroke: '#000',
  linewidth: 1.0,
  opacity: 1.0,
  visible: true,
  cap: 'round',  // set to 'butt' in Path constructor
  join: 'round', // set to 'miter' in Path constructor
  miter: 4,

  length: 0,
  closed: true,
  curved: false,
  automatic: true,
  beginning: 0,
  ending: 1.0,
  clip: false,
  
};
// rotation, translation, scale, mask from Shape


/**
value text.value
A string representing the text that will be rendered to the stage.

family text.family
A string representing the css font-family to be applied to the rendered text. Default value is 'sans-serif'.

size text.size
A number representing the text's size to be applied to the rendered text. Default value is 13.

leading text.leading
A number representing the leading, a.k.a. line-height, to be applied to the rendered text. Default value is 17.

alignment text.alignment
A string representing the horizontal alignment to be applied to the rendered text. e.g: 'left', 'right', or 'center'. Default value is 'middle'.

fill text.fill
A string representing the color for the text area to be filled. All valid css representations of color are accepted. Default value is '#000'.

stroke text.stroke
A string representing the color for the text area to be stroked. All valid css representations of color are accepted. Default value is 'transparent'.

linewidth text.linewidth
A number representing the linewidth to be applied to the rendered text. Default value is 1.

style text.style
A string representing the font style to be applied to the rendered text. e.g: 'normal' or 'italic'. Default value is 'normal'.

weight text.weight
A number or string representing the weight to be applied to the rendered text. e.g: 500 or 'normal'. For more information see the Font Weight Specification. Default value is 500.

decoration text.decoration
A string representing the text decoration to be applied to the rendered text. e.g: 'none', 'underlined', or 'strikethrough'. Default value is 'none'

baseline text.baseline
A string representing the vertical aligment to be applied to the rendered text. e.g: 'middle', 'baseline', or 'top'. Default value is 'middle'.

opacity text.opacity
A number representing the opacity of the path. Use strictly for setting. Must be a number 0-1.

visible text.visible
A boolean representing whether the text object is visible or not.
*/
 // extends Shape
 FN.Text = {
   value: '',
   family: 'sans-serif',
   size: 13,
   leading: 17,
   alignment: 'center',
   baseline: 'middle',
   style: 'normal',
   weight: 500,
   decoration: 'none',

   fill: '#000',
   stroke: 'transparent',
   linewidth: 1,
   opacity: 1,
   visible: true,

   clip: false
 };
 // rotation, translation, scale, mask, clip from Shape

export default FN;
