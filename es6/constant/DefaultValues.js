/* jshint esnext: true */

import RendererTypes from './RendererTypes';

var FN = {};

// https://two.js.org/#documentation

/*
type - the type of renderer: svg, webgl, canvas, etc.. Applicable types are carried within `constant/RendererTypes`. Default type is `RendererTypes.svg`.
width - the width of the drawing space.Disregarded if params.fullscreen is set to true. Default width is 640 pixels.
height - the height of the drawing space. Disregarded if params.fullscreen is set to true. Default height is 480 pixels.
autostart - A boolean to automatically add the instance to draw on requestAnimationFrame. This is a convenient substitute so you don't have to call two.play().
fullscreen- A boolean to set the drawing space of the instance to be fullscreen or not. If set to true then width and height parameters will not be respected.
ratio - Set the resolution ratio for canvas and webgl renderers. If left blank two.js automatically infers the ratio based on the devicePixelRatio api.
*/
FN.TwoClassic = {
  width: 640,
  height: 480,
  type: RendererTypes.svg,
  fullscreen: false,
  autostart: false
};

FN.TwoScene = {
  width: 640,
  height: 480,
  RendererDelegate: undefined, // must be imported and specified by the user.
};

FN.documentBodyStyle = {
  overflow: 'hidden',
  margin: 0,
  padding: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  position: 'fixed'
};
FN.sceneNodeBodyStyle = {
  display: 'block',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  position: 'fixed'
};

/*
rotation - A number that represents the rotation of the path in the drawing space, in radians.
scale - A `number` that represents the uniform scale of the path in the drawing space.
translation - A `Vector` that represents x, y translation of the path in the drawing space.
clip - A `boolean` describing whether to render this shape as a clipping mask. This property is set automatically in correspondence with `Group.mask`. Defaults to false.
*/
FN.Renderable = {
  translation: [0,0],
  rotation: 0,
  scale: 1,
  clip: false
  // mask: null,
};

FN.Shape = {
  translation: [0,0],
  rotation: 0,
  scale: 1,
};

FN.ShapeIdentifier = 'two_';

/*
stroke - A string representing the color for the stroke of all child shapes. Use strictly for setting. All valid css representations of color are accepted.
fill - A string representing the color for the area of all child shapes. Use strictly for setting. All valid css representations of color are accepted.
linewidth - A number representing the thickness of all child shapes' strokes. Use strictly for setting. Must be a positive number.
opacity - A number representing the opacity of all child shapes. Use strictly for setting. Must be a number 0-1.
cap - A string representing the type of stroke cap to render for all child shapes. Use strictly for setting. All applicable values can be found on the w3c spec. Defaults to "round".
join - A string representing the type of stroke join to render for all child shapes. Use strictly for setting. All applicable values can be found on the w3c spec. Defaults to "round".
miter - A number representing the miter limit for the stroke of all child objects. Use strictly for setting. Defaults to 1.
*/
// Path properties can be set at Group level, that will be trickled down to all children
// :REVIEW: why are text properties not included?
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
 // rotation, translation, scale, mask from Renderable


/*
stroke - A string representing the color for the stroke of the path. All valid css representations of color are accepted.
fill - A string representing the color for the area of the vertices. All valid css representations of color are accepted.
linewidth - A number representing the thickness the path's strokes. Must be a positive number.
opacity - A number representing the opacity of the path. Use strictly for setting. Must be a number 0-1.
cap - A string representing the type of stroke cap to render. All applicable values can be found on the w3c spec. Defaults to "round".
join - A string representing the type of stroke join to render. All applicable values can be found on the w3c spec. Defaults to "round".
miter - A number representing the miter limit for the stroke. Defaults to 1.
closed - Boolean that describes whether the path is closed or not.
curved - Boolean that describes whether the path is curved or not.
automatic - Boolean that describes whether the path should automatically dictate how Two.Anchors behave. This defaults to true.
beginning - A number, 0-1, that is mapped to the layout and order of vertices. It represents which of the vertices from beginning to end should start the shape. Exceedingly helpful for animating strokes. Defaults to 0.
ending - A number, 0-1, that is mapped to the layout and order of vertices. It represents which of the vertices from beginning to end should end the shape. Exceedingly helpful for animating strokes. Defaults to 1.
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
// rotation, translation, scale, mask from Renderable

/**
value - A string representing the text that will be rendered to the stage.
family - A string representing the css font-family to be applied to the rendered text. Default value is 'sans-serif'.
size - A number representing the text's size to be applied to the rendered text. Default value is 13.
leading - A number representing the leading, a.k.a. line-height, to be applied to the rendered text. Default value is 17.
alignment - A string representing the horizontal alignment to be applied to the rendered text. e.g: 'left', 'right', or 'center'. Default value is 'middle'.
fill - A string representing the color for the text area to be filled. All valid css representations of color are accepted. Default value is '#000'.
stroke - A string representing the color for the text area to be stroked. All valid css representations of color are accepted. Default value is 'transparent'.
linewidth - A number representing the linewidth to be applied to the rendered text. Default value is 1.
style - A string representing the font style to be applied to the rendered text. e.g: 'normal' or 'italic'. Default value is 'normal'.
weight- A number or string representing the weight to be applied to the rendered text. e.g: 500 or 'normal'. For more information see the Font Weight Specification. Default value is 500.
decoration- A string representing the text decoration to be applied to the rendered text. e.g: 'none', 'underlined', or 'strikethrough'. Default value is 'none'
baseline - A string representing the vertical aligment to be applied to the rendered text. e.g: 'middle', 'baseline', or 'top'. Default value is 'middle'.
opacity - A number representing the opacity of the path. Use strictly for setting. Must be a number 0-1.
visible - A boolean representing whether the text object is visible or not.
*/
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
}; // rotation, translation, scale, mask, clip from Renderable


FN.Gradient = {
  spread: 'pad'
};

/*
center -- A `Vector` that represents the position of the x, y coordinates at the center of the gradient.
radius -- A number representing the radius of the radialGradient.
focal -- A `Vector` that represents the position of the x, y coordinates as the focal point for the gradient's trajectory.
spread -- Defines how the gradient is rendered by the renderer. For more details see the w3c svg spec.
stops -- A `Collection` of `Stops` that is two-way databound. Individual stops may be manipulated.
*/
FN.RadialGradient = {
  radius: 20
};

/**
left -- A `Vector` that represents the position of the x, y coordinates to the “left” of the gradient's two end points.
right -- A `Vector` that represents the position of the x, y coordinates to the “right” of the gradient's two end points.
spread -- Defines how the gradient is rendered by the renderer. For more details see the w3c svg spec.
stops -- A `Collection` of `Stop` instances that is two-way databound. Individual stops may be manipulated.
*/
FN.LinearGradient = {
  stops: undefined,
  left: undefined,
  right: undefined
};


export default FN;
