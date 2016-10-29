import is  from '../util/is';
import _  from '../util/common';
import dom   from '../platform/dom';
import base   from './shape/base';
import Renderer from '../TwoRenderer';

/**
 * @class
 */
class SvgRenderer extends Renderer {

  constructor(options) {
    super(options);
    if(!this.domElement) {this.domElement = base.createElement('svg'); };
    this.defs = base.createElement('defs');
    this.domElement.appendChild(this.defs);
    this.domElement.defs = this.defs;
    this.domElement.style.overflow = 'hidden';

  }

  setSize(width, height) {
    super.setSize(width, height);
    base.setAttributes(this.domElement, {
      width: width,
      height: height
    });
    return this;
  }

  render() {
    base.renderShape(this.scene, this.domElement);
    return this;
  }    

}


export default SvgRenderer;