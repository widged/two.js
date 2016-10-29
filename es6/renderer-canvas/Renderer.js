import is  from '../util/is';
import dom  from '../platform/dom';
import base from './shape/base';
import Renderer from '../TwoRenderer';

var {isUndefined} = is;
var {getRatio} = dom;

class CanvasRenderer extends Renderer {

  constructor(options) {

    super(options)
    // Smoothing property. Defaults to true
    // Set it to false when working with pixel art.
    // false can lead to better performance, since it would use a cheaper interpolation algorithm.
    // It might not make a big difference on GPU backed canvases.
    var smoothing = (options.smoothing !== false);
    if(!this.domElement) {this.domElement = document.createElement('canvas'); };
    this.ctx = this.domElement.getContext('2d');
    this.overdraw = options.overdraw || false;

    if (!isUndefined(this.ctx.imageSmoothingEnabled)) {
      this.ctx.imageSmoothingEnabled = smoothing;
    }
  }

  setSize(width, height, ratio) {
    
    super.setSize(width, height);
    this.ratio = isUndefined(ratio) ? getRatio(this.ctx) : ratio;
    this.domElement.width = width * this.ratio;
    this.domElement.height = height * this.ratio;

    if (this.domElement.style) {
      Object.assign(this.domElement.style, {
        width: width + 'px',
        height: height + 'px'
      });
    }

    return this;

  }

  render() {

    var isOne = this.ratio === 1;

    if (!isOne) {
      this.ctx.save();
      this.ctx.scale(this.ratio, this.ratio);
    }

    if (!this.overdraw) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }

    base.renderShape(this.scene, this.ctx);

    if (!isOne) {
      this.ctx.restore();
    }

    return this;

  }

}


export default CanvasRenderer;