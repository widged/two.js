/* jshint esnext: true */

/**
 * two.js
 * a two-dimensional drawing api meant for modern browsers. It is renderer
 * agnostic enabling the same api for rendering in multiple contexts: webgl,
 * canvas2d, and svg.
 *
 * Copyright (c) 2012 - 2016 jonobr1 / http://jonobr1.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import EventEmitter  from './util/EventEmitter';
import DefaultValues from './constant/DefaultValues';
import TwoEvent from './constant/TwoEvent';
import dom from './platform/dom';
import Player from './util/Player';
import Renderer from './TwoRenderer';
import makeShape from './shape/factories';

var TwoDefaults = DefaultValues.Two;

/**
 * @class
 */
class Two {

  constructor(config) {
    this.dispatcher = new EventEmitter(Object.keys(TwoEvent));
    var {width, height, type, fullscreen, autostart} = Object.assign(TwoDefaults, config);

    var RendererDelegate = Renderer.loadRendererOfType(type, this, config.domElement);

    /**
    renderer- The instantiated rendering class for the instance. For a list of possible rendering types check out RendererTypes.
    scene - The base level `Group` which houses all drawable shapes. Because it is a `Group` transformations can be applied to it that will affect all objects in the instance. This is handy as a makeshift camera.
    */

    this.state = {
      fullscreen,  width, height, // either fullscreen or width and height
      autostart,
      type: type,
      scene: makeShape.group(),
      domElement: undefined,
      ratio: undefined,
      player: new Player(autostart)
    };
    this.state.renderer = new RendererDelegate(this);


    if (this.state.fullscreen) {
      document.body.style= Object.assign(document.body.style, DefaultValues.documentBodyStyle);
      this.state.renderer.domElement.style = Object.assign(this.state.renderer.domElement.style, DefaultValues.sceneNodeBodyStyle);
      var fitToWindow = () => {
        var {width, height} = dom.getWindowSize();
        this.state.width = width;
        this.state.height = height;
        this.state.renderer.setSize(width, height, this.ratio);
        this.whenResized();
      };
      dom.onWindowResize(() => { fitToWindow(); });
      fitToWindow();
    } else if (!dom.isElement(this.state.domElement)) {
      this.state.renderer.setSize(this.state.width, this.state.height, this.state.ratio);
    }
    // Defer calling player.activate until all objects
    // have been updated with their newest styles.
    var player = this.state.player;
    player.dispatcher.on('tick', (frameCount, timeDelta) => { this.update(); });
    if(!!this.state.autostart) { player.play(); }
  }

 /*
  These events are not captured internally.
  They are provided for the user to
 */
  whenUpdated() {
    // That event doesn't get captured internally, only when
    var {frameCount, timeDelta} = this.state.player;
    this.dispatcher.emit(TwoEvent.update, frameCount, timeDelta);
  }
  whenRendered() {
    var {frameCount} = this.state.player;
    this.dispatcher.emit(TwoEvent.render, frameCount);
  }
  whenResized(width, height) {
    this.dispatcher.emit(TwoEvent.resize, this.state.width, this.state.height);
  }

  get width()  { return this.state.width; }
  get height() { return this.state.height; }
  get type()   { return this.state.type; }
  get scene()  { return this.state.scene; }
  /**
   * A convenient method to append the instance's dom element to the page.
   * It's required to add the instance's dom element to the page in order to
   * see anything drawn.
   */
  appendTo(elem) {
    elem.appendChild(this.state.renderer.domElement);
    return this;
  }

  /**
   * This method updates the dimensions of the drawing space and makes the
   * active renderer draw all visible shapes on the scene
   */

  update() {

    this.whenUpdated();

    var {width, height, renderer, ratio} = this.state;
    if (width !== renderer.width || height !== renderer.height) {
      renderer.setSize(width, height, ratio);
    }

    var render = this.state.renderer.render();
    this.whenRendered();
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
    this.state.scene.remove(Array.from(this.state.scene.children));
    return this;
  }

  /**
   * Convenience methods to add to the scene various shape types
   */

   // makeGroup(o1, o2, oN) - accepts an array of objects, `Paths` or `Groups` and returns a Two.Group object.
   makeGroup(objects) {
     var gp = makeShape.group();
     this.state.scene.add(gp);
     if (!(objects instanceof Array)) {
       objects = Array.from(arguments);
     }
     gp.add(objects);
     return gp;
   }

  makeCurve(p) {
    var pth = makeShape.curve(p);
    makeShape.centerPath(pth); // :WARN: consider making this optional as make this optional
    this.state.scene.add(pth);
    return pth;
  }
  makePath(p) {
    var pth = makeShape.path(p);
    makeShape.centerPath(pth); // :WARN: consider making this optional as make this optional
    this.state.scene.add(pth);
    return pth;
  }
  makeText(...args) {
    var txt = makeShape.text(...args);
    this.add(txt);
    return txt;
  }
  makeLinearGradient(x1, y1, x2, y2, ...stops) {
    var gradient = makeShape.linearGradient(x1, y1, x2, y2, stops);
    this.add(gradient);
    return gradient;
  }
  makeRadialGradient(x1, y1, r, ...stops) {
    var gradient = makeShape.radialGradient(x1,y1,r,stops);
    this.add(gradient);
    return gradient;
  }

  /**
   * Draws a custom geometry to the instance's drawing space.
   * Geometries defined as a Path
   */
  addGeometry({points, translation, rotation}) {
    var pth = makeShape.geometry(points);
    pth.translation.set(...translation);
    if(rotation) { pth.rotation = rotation; }
    this.state.scene.add(pth);
    return pth;
  }

  addImport(nodes, shape) {
    if(!Array.isArray(nodes)) { nodes = [nodes]; }
    var group = this.add(makeShape.group());
    nodes.forEach((node) => { group.add(shape); });
    return group;
  }

}

export default Two;
