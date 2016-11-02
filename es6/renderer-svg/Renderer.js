/* jshint esnext: true */

import base   from './shape/base';
import Renderer from '../TwoRenderer';

var {renderShape, createSvgElement, setAttributes} = base;

/**
 * @class
 */
class SvgRenderer extends Renderer {

  constructor(scene, options) {
    super(scene , options);
  }

  getDomNode() {
    return createSvgElement('svg', { version: 1.1 });
  }

  initializeContext(options) {
    var {domElement} = this.getState();
    var defs = createSvgElement('defs');
    domElement.appendChild(defs);
    domElement.defs = defs;
    domElement.style.overflow = 'hidden';
    this.defs = defs;
    this.setState({defs});
  }


  setSize(width, height) {
    super.setSize(width, height);
    var {domElement} = this.getState();
    setAttributes(domElement, {
      width: width,
      height: height
    });
    return this;
  }

  render() {
    renderShape(this.scene, this.domElement);
    return this;
  }

}


export default SvgRenderer;
