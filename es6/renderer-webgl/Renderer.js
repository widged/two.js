/* jshint esnext: true */

import _  from '../util/common';
import is  from '../util/is';
import Array2   from '../struct/Array';
import dom  from '../platform/dom';
import Renderer from '../renderer-lib/TwoRenderer';
import base from './renderable/base';
import shapeRendering   from '../renderer-lib/renderer-bridge';
import glFN   from './renderable/fn-gl';

var {isUndefined} = is;
var {raiseFlags, dropFlags} = shapeRendering;

/**
 * Constants
 */

var identity = [1, 0, 0, 0, 1, 0, 0, 0, 1];


class WebglRenderer extends Renderer {

  constructor(scene, options) {
    super(scene, options);

    this.setState({
      matrix: new Array2(identity),
      scale: 1,
      opacity: 1,
      renderer: {
        matrix: new Array2(identity),
        scale: 1,
        opacity: 1
      },
      overdraw: (options.overdraw === true) ? true : false
    });

    raiseFlags(scene, ['matrix']);

  }

  getDomNode() { return document.createElement('canvas'); }
  initializeContext(options) {
    // http://games.greggman.com/game/webgl-and-alpha/
    // http://www.khronos.org/registry/webgl/specs/latest/#5.2
    options = Object.assign(options || {}, {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
      stencil: true,
      preserveDrawingBuffer: true,
    });

    var {gl, program} = glFN.initializeGL(this.state.domElement, options);
    this.state.ctx     = gl;
    this.state.program = program;

  }

  get matrix() {
    return this.state.matrix;
  }
  set matrix(_) { throw('webgl - set matrix'); }
  get domElement() {  return this.state.domElement; }
  set domElement(_) {
    this.state.domElement = _;
    console.log('webgl - set domElement')
  }
  get ctx() { return this.state.ctx; }
  set ctx(_) {
    this.state.ctx = _;
    console.log('webgl - set ctx')
  }
  get program() { return this.state.program; }
  set program(_) {
    this.state.program = _;
    console.log('webgl - set program')
  }

  whenSizeChange() {

    // udate dom  node size
    var {domElement, width, height, scale, ctx, program, matrix} = this.getState();
    dom.updateDomNodeSize(domElement, width, height, scale);

    // udate gl resolution
    ctx = glFN.updateResolution(ctx, program, width * scale, height * scale);

    // udate matrix - Set for this.stage parent scaling to account for HDPI
    matrix[0] = matrix[4] = scale;

    // reset changed properties
    this.setState({ctx, matrix});

    // raise flags
    raiseFlags(this, ['matrix']);
  }

  setSize(width, height, ratio) {
    var {getDeviceRatio, getCanvasContextRatio} = dom;
    var {ctx} = this.getState();
    var scale = ratio;
    if (isUndefined(ratio)) {
        var deviceRatio  = getDeviceRatio() || 1;
        var canvasRatio = getCanvasContextRatio(ctx) || deviceRatio;
        scale = deviceRatio / canvasRatio;
    }
    this.setState({scale, width, height});
    this.whenSizeChange();
    return this;
  }

  render() {
    var {ctx, overdraw, scene, program} = this.getState();
    if (!overdraw) { glFN.clear(ctx); }
    base.renderScene(scene, ctx, program);
    dropFlags(this, ['matrix']);
    return this;
  }
}



export default WebglRenderer;
