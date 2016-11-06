/* jshint esnext: true */

import RenderableDefaults from './renderable/RenderableDefaults';
import makeShape from './renderable/factories';

/**
 * @class
 */
class TwoScene {

  constructor(config) {
    var {width, height, RendererDelegate, beforeRender} = Object.assign(RenderableDefaults.TwoScene, config);

    /**
    renderer- The instantiated rendering class for the instance. For a list of possible rendering types check out RendererTypes.
    scene - The base level `Group` which houses all drawable shapes. Because it is a `Group` transformations can be applied to it that will affect all objects in the instance. This is handy as a makeshift camera.
    */
    this.state = {
      width, height,
      scene: makeShape.group(),
    };

    // this is never set
    if(typeof beforeRender === 'function') {  beforeRender(this, config);  }
    this.state.renderer = new this.state.RendererDelegate(this.state.scene, {});
    this.refreshRenderer();
  }

  refreshRenderer (cb) {
    var ratio = 1;
    this.state.renderer.setSize(this.state.width, this.state.height, ratio);
    if(typeof cb === 'function') { cb(); }
  }

  /**
   * A convenient method to append the instance's dom element to the page.
   * It's required to add the instance's dom element to the page in order to
   * see anything drawn.
   */
  appendTo(domNode) {
    domNode.appendChild(this.state.renderer.domElement);
    return this;
  }

  /**
   * This method updates the dimensions of the drawing space and makes the
   * active renderer draw all visible shapes on the scene
   */

  update(whenUpdated, whenRendered) {

    whenUpdated();

    var {width, height, renderer} = this.state;
    if (width !== renderer.width || height !== renderer.height) {
      renderer.setSize(width, height);
    }

    var render = this.state.renderer.render();
    whenRendered();
    return render;
  }

  /**
   * Convenience Methods
   */

  /**
   * Add one or many shapes / groups to the instance. Objects can be added as arguments, two.add(o1, o2, oN), or as an array depicted above.
   */
  add(o) {

    var objects = o;
    if (!(objects instanceof Array)) {
      objects = Array.from(arguments);
    }

    this.state.scene.add(objects);
    return this;

  }

  /**
   * Remove one or many shapes / groups from the instance. Objects can be removed as arguments, two.remove(o1, o2, oN), or as an array depicted above.
   */
  remove(o) {

    var objects = o;
    if (!(objects instanceof Array)) {
      objects = Array.from(arguments);
    }

    this.state.scene.remove(objects);

    return this;

  }

  /**
   * Removes all objects from the instance's scene. If you intend to have the browser garbage collect this, don't forget to delete the references in your application as well.
   */
  clear() {
    this.state.scene.remove(Array.from(this.state.scene.childrenColl));
    return this;
  }

  /**
   * Draws a custom geometry to the instance's drawing space.
   * Geometries defined as a Path
   */

  addGeometry({points, translation, rotation}) {
    var pth = makeShape.geometry(points);
    if(translation) { pth.setTranslation(...translation) } ;
    if(rotation) { pth.rotation = rotation; }
    this.state.scene.add(pth);
    return pth;
  }

  addShape(shape, centerIt) {
    if(centerIt) {
      // can only be applied to path?
      makeShape.centerPath(shape);
    }
    this.state.scene.add(shape);
    return shape;
  }

   // addGroup(o1, o2, oN) - accepts an array of objects, `Paths` or `Groups` and returns a Two.Group object.
   addGroup(objects) {
     if (!(objects instanceof Array)) { objects = Array.from(arguments); }
     var gp = makeShape.group();
     gp.add(objects);
     this.state.scene.add(gp);
     return gp;
   }

   addImport(nodes, shape) {
     if(!Array.isArray(nodes)) { nodes = [nodes]; }
     var group = this.add(makeShape.group());
     nodes.forEach((node) => { group.add(shape); });
     return group;
   }


}

export default TwoScene;
