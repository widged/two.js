/* jshint esnext: true */

class Renderer {

  constructor(scene, options) {
    // Everything drawn on the canvas needs to come from the stage.
    // :REVIEW: parent of a scene, a renderer?
    scene.parent = this;
    var domElement = this.getDomNode();
    this.setState({ scene, domElement });
    this.initializeContext(options);
  }

  // --------------------
  // IStated
  // --------------------
  getState() {
    return this.state;
  }
  setState(obj) {
    if(typeof obj === 'object') {
      this.state = Object.assign(this.state || {}, obj);
    }
  }

  // --------------------
  // Enforce Contract
  // --------------------
  getDomNode() { throw "[Tworenderer.getDomNode] must be implemented by any inheriting component"; }
  initializeContext(options) { throw "[Tworenderer.initializeContext] must be implemented by any inheriting component"; }
  whenSizeChange(width, height, scale) { throw "[Tworenderer.whenSizeChange] must be implemented by inheriting component"; }
  setSize(width, height /*, ratio */) { throw "[Tworenderer.setSize] must be implemented by any inheriting component"; }
  render() { throw "[Tworenderer.render] must be implemented by any inheriting component"; }

  // --------------------
  // Public access to state properties
  // --------------------
  get domElement() {
    return this.state.domElement;
  }

}



export default Renderer;
