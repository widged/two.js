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
import EventEmitter  from './util/EventEmitter';
import makeShape from './renderable/factories';
import Player from './util/Player';
import DefaultValues from './constant/DefaultValues';
import TwoEventTypes from './constant/TwoEventTypes';
import dom from './platform/dom';
import RendererLoader from './renderer-lib/renderer-loader';

var beforeRender = (two, classicConfig) => {

};

/**
 * @class
 */
class TwoClassic extends TwoScene  {

  constructor(classicConfig) {
    var {width, height, type, fullscreen, autostart} = Object.assign(DefaultValues.TwoClassic, classicConfig);

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
        document.body.style= Object.assign(document.body.style, DefaultValues.documentBodyStyle);
        two.state.renderer.domElement.style = Object.assign(two.state.renderer.domElement.style, DefaultValues.sceneNodeBodyStyle);
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

    super({width, height, beforeRender});
  }



  /*
   These events are not captured internally.
   They are provided for the user to
  */
   whenUpdated() {
     // That event doesn't get captured internally, only when
     var {frameCount, timeDelta} = this.state.player;
     this.dispatcher.emit(TwoEventTypes.update, frameCount, timeDelta);
   }
   whenRendered() {
     var {frameCount} = this.state.player;
     this.dispatcher.emit(TwoEventTypes.render, frameCount);
   }
   whenResized(width, height) {
     this.dispatcher.emit(TwoEventTypes.resize, this.state.width, this.state.height);
   }

   makeGroup(...objects) {
     return this.addGroup(...objects);
   }

   makeGeometry(...objects) {
     return this.addGeometry(...objects);
   }

  /**
   * Convenience methods to add to the scene various shape types
   */
 makeCurve(p) {
   var pth = makeShape.curve(p);
   this.addShape(pth, true);
   return pth;
 }
 makePath(p) {
   var pth = makeShape.path(p);
   this.addShape(pth, true);
   return pth;
 }
 makeText(...args) {
   var txt = makeShape.text(...args);
   this.addShape(txt);
   return txt;
 }
 makeLinearGradient(x1, y1, x2, y2, ...stops) {
   var gradient = makeShape.linearGradient(x1, y1, x2, y2, stops);
   this.addShape(gradient);
   return gradient;
 }
 makeRadialGradient(x1, y1, r, ...stops) {
   var gradient = makeShape.radialGradient(x1,y1,r,stops);
   this.addShape(gradient);
   return gradient;
 }

}

export default TwoClassic;
