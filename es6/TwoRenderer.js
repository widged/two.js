/* jshint esnext: true */

import RendererTypes from './constant/RendererTypes';
import dom from './platform/dom';

class Renderer {

  constructor(scene, options) {
    // Everything drawn on the canvas needs to come from the stage.

    // :REVIEW: parent of a scene, a renderer?
    scene.parent = this;
    var domElement = this.getDomNode();
    this.setState({ scene, domElement });
    this.initializeContext(options);
    this.domElement = domElement;
    this.scene = scene;
  }

  getDomNode() { }
  initializeContext(options) {}

  setState(obj) {
    if(typeof obj === 'object') {
      this.state = Object.assign(this.state || {}, obj);
    }
  }

  getState() {
    return this.state;
  }


  setSize(width, height) {
    this.width = width;
    this.height = height;
    // dom.updateDomNodeSize(domElement, width, height, scale);
    this.setState({width, height});
  }

  render() {
  	throw "A render function must be provided";
  }
}

var defaultToType = (type, domElement) => {
  // Specified domElement overrides type declaration only if the element does not support declared renderer type.
  if (dom.isElement(domElement)) {
    var tagName = domElement.tagName.toLowerCase();
    // TODO: Reconsider this if statement's logic.
    if (!/^(CanvasRenderer-canvas|WebGLRenderer-canvas|SVGRenderer-svg)$/.test(this.state.type+'-'+tagName)) {
      type = tagName;
    }
  }
  return type;
};

Renderer.loadRendererOfType = (type, two, domElement) => {
  if('svg,webgl,canvas'.includes(type)) { type = RendererTypes[type]; }

  var rendererType = defaultToType(type, domElement);

  // Determine what Renderer to use and setup a scene.
  var renderers = {};
  renderers[RendererTypes.webgl]  = './renderer-webgl/Renderer';
  renderers[RendererTypes.canvas] = './renderer-canvas/Renderer';
  renderers[RendererTypes.svg]    = './renderer-svg/Renderer';
  var rendererModule = renderers[type];
  if(!rendererModule) { throw 'Two expects a valid renderType. Specify one of `svg`,`webgl`, or `canvas`.'; }
  var Module = require(rendererModule).default;
  if(!Module) { throw `Two could not load the renderer module: '${rendererModule}'.`; }
  return Module;
};

export default Renderer;
