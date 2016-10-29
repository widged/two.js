class Renderer {
  
  constructor(options) {
    this.domElement = options.domElement;
    // Everything drawn on the canvas needs to come from the stage.
    this.scene = options.scene;
    this.scene.parent = this;
  }
  
  setSize(width, height) {
      this.width = width;
      this.height = height;
  }

  render() {
  	throw "A render function must be provided";
  }
}

export default Renderer;

