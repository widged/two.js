/* jshint esnext: true */

import RendererTypes from './constant/RendererTypes';
import dom from './platform/dom';

var FN = {};

FN.loadModule = (pth) => {
  var Module = require(pth).default;
  if(!Module) { throw `[rendrer-loader.loadModule] could not find a module at path: '${pth}'.`; }
  return Module;
};

FN.load = (type, two, domElement) => {
  var {loadModule} = FN;
  if('svg,webgl,canvas'.includes(type)) { type = RendererTypes[type]; }

  // Specified domElement overrides type declaration only if the element does not support declared renderer type.
  var elmType = dom.nodeType(domElement);
  if (elmType && !/^(CanvasRenderer-canvas|WebGLRenderer-canvas|SVGRenderer-svg)$/.test(type+'-'+elmType)) {
    type = elmType;
  }

  // Determine what Renderer to use and setup a scene.
  var renderers = {};
  renderers[RendererTypes.webgl]  = './renderer-webgl/Renderer';
  renderers[RendererTypes.canvas] = './renderer-canvas/Renderer';
  renderers[RendererTypes.svg]    = './renderer-svg/Renderer';
  var pth = renderers[type];
  if(!pth) { throw '[renderer-loader.loadModule] expects a valid module path. Specify one of `svg`,`webgl`, or `canvas`.'; }
  return loadModule(pth);
};

export default FN;
