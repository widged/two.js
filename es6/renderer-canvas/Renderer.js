/* jshint esnext: true */

import is  from '../lib/is/is';
import dom  from '../platform/dom';
import base from './renderable/base';
import Renderer from '../renderer/TwoRenderer';

const {isUndefined} = is;
const {getRatio} = dom;

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
    const {domElement} = this.getState();
    const canvas    = domElement.getContext('2d');
    const smoothing = (options.smoothing === true) ? true : false;
    if (!isUndefined(canvas.imageSmoothingEnabled)) {
      canvas.imageSmoothingEnabled = smoothing;
    }
    this.setState({ctx: canvas});
  }

  whenSizeChange() {
    // udate dom  node size
    const {domElement, width, height, scale} = this.getState();
    dom.updateDomNodeSize(domElement, width, height, scale);
  }

  setSize(width, height, ratio) {
    const {getDeviceRatio, getCanvasContextRatio} = dom;
    const {ctx} = this.getState();
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

    const {ctx, scale, overdraw, width, height, scene} = this.getState();

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
