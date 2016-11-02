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
    this.setState({defs});
  }

  get defs() {
    return this.state.defs;
  }

  whenSizeChange() {
    var {domElement, width, height} = this.getState();
    setAttributes(domElement, { width, height });
  }

  setSize(width, height) {
    this.setState({width, height});
    this.whenSizeChange();
    return this;
  }

  render() {
    var {scene, domElement} = this.getState();
    renderShape(scene, domElement);
    return this;
  }

}


export default SvgRenderer;
