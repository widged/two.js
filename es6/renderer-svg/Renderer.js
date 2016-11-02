/* jshint esnext: true */

import base   from './shape/base';
import Renderer from '../TwoRenderer';
import svgFN    from './shape/fn-svg';

var {renderScene} = base;
var {createElement, setAttributes} = svgFN;


/**
 * @class
 */
class SvgRenderer extends Renderer {

  constructor(scene, options) {
    super(scene , options);
  }

  getDomNode() {
    return createElement('svg', { version: 1.1 });
  }

  initializeContext(options) {
    var {domElement} = this.getState();
    var defs = createElement('defs');
    domElement.appendChild(defs);
    domElement.defs = defs;
    domElement.style.overflow = 'hidden';
    this.setState({defs});
  }

  get defs() { return this.state.defs; }

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
    renderScene(scene, domElement);
    return this;
  }

}


export default SvgRenderer;
