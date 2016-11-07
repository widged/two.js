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

/* jshint esnext: true */

// classic interface for two.js
import TwoScene  from './TwoScene';
import EventEmitter  from './lib/event-emitter/EventEmitter';
import makeShape from './renderable/factories';
import Player from './lib/player/Player';
import RenderableDefaults from './renderable/RenderableDefaults';
import TwoEventTypes from './TwoEventTypes';
import dom from './platform/dom';
import RendererLoader from './renderer/renderer-loader';

var beforeRender = (two, classicConfig) => {

};

/**
 * @class
 */
class TwoClassic   {

  constructor(classicConfig) {
    var {width, height, type, fullscreen, autostart} = Object.assign(RenderableDefaults.TwoClassic, classicConfig);

    var beforeRender = (two) => {

      two.state.RendererDelegate = RendererLoader.load(type, two, classicConfig.domElement);

      two.dispatcher = new EventEmitter(Object.keys(TwoEventTypes));

      // Defer calling player.activate until all objects
      // have been updated with their newest styles.
      two.state.player = new Player(autostart);

      var player = two.state.player;
      player.dispatcher.on('tick', (frameCount, timeDelta) => { two.update(); });
      if(!!two.state.autostart) { player.play(); }

      if (two.state.fullscreen) {
        document.body.style= Object.assign(document.body.style, RenderableDefaults.documentBodyStyle);
        two.state.renderer.domElement.style = Object.assign(two.state.renderer.domElement.style, RenderableDefaults.sceneNodeBodyStyle);
        var fitToWindow = () => {
          var {width, height} = dom.getWindowSize();
          two.state.width = width;
          two.state.height = height;
        };
        dom.onWindowResize(() => {
          fitToWindow();
          two.resizeRenderer();
          two.whenResized();
        });
        fitToWindow();
      }

    };

    this.state = {};
    this.state.scene = new TwoScene({width, height, beforeRender});
  }

  /*
   These events are not captured internally.
   They are provided for the user to
  */
   whenUpdated() {
     // That event doesn't get captured internally, only when
     if(this.state.player) {
       var {frameCount, timeDelta} = this.state.player;
       this.dispatcher.emit(TwoEventTypes.update, frameCount, timeDelta);
     }
   }
   whenRendered() {
     if(this.state.player) {
       var {frameCount} = this.state.player;
       this.dispatcher.emit(TwoEventTypes.render, frameCount);
    }
   }
   whenResized(width, height) {
     if(this.dispatcher) {
       this.dispatcher.emit(TwoEventTypes.resize, this.state.width, this.state.height);
     }
   }


   appendTo(domNode) {
     const {scene} = this.state;
     scene.appendTo(domNode);
     return this;
   }


   update() {
     const {scene} = this.state;
     scene.update(
       () => { this.whenUpdated();  },
       () => { this.whenResized(); }
     );
     return this;
   }


   makeGroup(...objects) {
     const {scene} = this.state;
     return scene.addGroup(...objects);
   }

   makeGeometry(...objects) {
     const {scene} = this.state;
     return scene.addGeometry(...objects);
   }

  /**
   * Convenience methods to add to the scene various shape types
   */
 makeCurve(p) {
   const {scene} = this.state;
   var pth = makeShape.curve(p);
   scene.addShape(pth, true);
   return pth;
 }
 makePath(p) {
   const {scene} = this.state;
   var pth = makeShape.path(p);
   scene.addShape(pth, true);
   return pth;
 }
 makeText(...args) {
   const {scene} = this.state;
   var txt = makeShape.text(...args);
   scene.addShape(txt);
   return txt;
 }
 makeLinearGradient(x1, y1, x2, y2, ...stops) {
   const {scene} = this.state;
   var gradient = makeShape.linearGradient(x1, y1, x2, y2, stops);
   scene.addShape(gradient);
   return gradient;
 }
 makeRadialGradient(x1, y1, r, ...stops) {
   const {scene} = this.state;
   var gradient = makeShape.radialGradient(x1,y1,r,stops);
   scene.addShape(gradient);
   return gradient;
 }

}

export default TwoClassic;
