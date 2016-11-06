/* jshint esnext: true */

import is  from '../util/is';
import dom  from '../platform/dom';
import base from './renderable/base';
import Renderer from '../renderer-lib/TwoRenderer';

var {isUndefined} = is;
var {getRatio} = dom;

class CanvasRenderer extends Renderer {

  constructor(scene, options) {

    super(scene, options);
    // Smoothing property. Defaults to true. Set it to false when working with pixel art.
    // false can lead to better performance, since it would use a cheaper interpolation algorithm.
    // It might not make a big difference on GPU backed canvases.
    this.setState({
      overdraw: (options.overdraw === true) ? true : false,
      scale: options.ratio
    });
  }

  getDomNode() {
    return document.createElement('canvas');
  }

  initializeContext(options) {
    var {domElement} = this.getState();
    var canvas    = domElement.getContext('2d');
    var smoothing = (options.smoothing === true) ? true : false;
    if (!isUndefined(canvas.imageSmoothingEnabled)) {
      canvas.imageSmoothingEnabled = smoothing;
    }
    this.setState({ctx: canvas});
  }

  whenSizeChange() {
    // udate dom  node size
    var {domElement, width, height, scale} = this.getState();
    dom.updateDomNodeSize(domElement, width, height, scale);
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
    this.setState({width, height, scale});
    this.whenSizeChange();
    return this;
  }

  render() {

    var {ctx, scale, overdraw, width, height, scene} = this.getState();

    var isOne = (scale === 1) ? true : false;

    if (!isOne) {
      ctx.save();
      ctx.scale(scale, scale);
    }

    if (!overdraw) {
      ctx.clearRect(0, 0, width, height);
    }

    base.renderScene(scene, ctx);

    if (!isOne) { ctx.restore(); }

    return this;

  }

}


export default CanvasRenderer;
