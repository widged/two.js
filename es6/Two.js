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

import DefaultValues from './constant/DefaultValues';
import TwoEvent from './constant/TwoEvent';
import is   from './util/is';
import _  from './util/common';
import EventEmitter  from './util/EventEmitter';
import RendererTypes from './constant/RendererTypes';
import dom from './platform/dom';
import perf from './platform/Performance';
import Shape from './Shape';
import Group from './shape/Group';
import factories from './shape/_factories';

var TwoDefaults = DefaultValues.Two;

var root = this;

var {isNumber, isArray} = is;


/**

type two.type
A string representing which type of renderer the instance has implored.

frameCount two.frameCount
A number representing how many frames have elapsed.

timeDelta two.timeDelta
A number representing how much time has elapsed since the last frame in milliseconds.

width two.width
The width of the instance's dom element.

height two.height
The height of the instance's dom element.

playing two.playing
A boolean representing whether or not the instance is being updated through the automatic requestAnimationFrame.

renderer two.renderer
The instantiated rendering class for the instance. For a list of possible rendering types check out Two.Types.

scene two.scene
The base level Two.Group which houses all objects for the instance. Because it is a Two.Group transformations can be applied to it that will affect all objects in the instance. This is handy as a makeshift camera.

appendTo two.appendTo(domElement);
A convenient method to append the instance's dom element to the page. It's required to add the instance's dom element to the page in order to see anything drawn.

play two.play();
This method adds the instance to the requestAnimationFrame loop. In affect enabling animation for this instance.

pause two.pause();
This method removes the instance from the requestAnimationFrame loop. In affect halting animation for this instance.

update two.update();
This method updates the dimensions of the drawing space, increments the tick for animation, and finally calls two.render(). When using the built-in requestAnimationFrame hook, two.play(), this method is invoked for you automatically.

render two.render();
This method makes the instance's renderer draw. It should be unnecessary to invoke this yourself at anytime.

add two.add(objects);
Add one or many shapes / groups to the instance. Objects can be added as arguments, two.add(o1, o2, oN), or as an array depicted above.

remove two.remove(objects);
Remove one or many shapes / groups from the instance. Objects can be removed as arguments, two.remove(o1, o2, oN), or as an array depicted above.

clear two.clear();
Removes all objects from the instance's scene. If you intend to have the browser garbage collect this, don't forget to delete the references in your application as well.


makeCurve two.makeCurve(x1, y1, x2, y2, xN, yN, open);
Draws a curved path to the instance's drawing space. The arguments are a little tricky. It returns a Two.Path object.
The method accepts any amount of paired x, y values as denoted by the series above. It then checks to see if there is a final argument, a boolean open, which marks whether or not the shape should be open. If true the curve will have two clear endpoints, otherwise it will be closed.
This method also recognizes the format two.makeCurve(points, open) where points is an array of Two.Anchor's and open is an optional boolean describing whether or not to expose endpoints. It is imperative if you generate curves this way to make the list of points Two.Anchor's.
makePath two.makePath(x1, y1, x2, y2, xN, yN, open);
Draws a path to the instance's drawing space. The arguments are a little tricky. It returns a Two.Path object.
The method accepts any amount of paired x, y values as denoted by the series above. It then checks to see if there is a final argument, a boolean open, which marks whether or not the shape should be open. If true the path will have two clear endpoints, otherwise it will be closed.
This method also recognizes the format two.makePath(points, open) where points is an array of Two.Anchor's and open is an optional boolean describing whether or not to expose endpoints. It is imperative if you generate curves this way to make the list of points Two.Anchor's.
 The Two.Path that this method creates is the base shape for all of the make functions.
makeGroup two.makeGroup(objects);
Adds a group to the instance's drawing space. While a group does not have any visible features when rendered it allows for nested transformations on shapes. See Two.Group for more information. It accepts an array of objects, Two.Paths or Two.Groups. As well as a list of objects as the arguments, two.makeGroup(o1, o2, oN). It returns a Two.Group object.
interpret two.interpret(svgNode);
Reads an svg node and draws the svg object by creating Two.Paths and Two.Groups from the reference. It then adds it to the instance's drawing space. It returns a Two.Group object.
bind two.bind(event, callback);
Bind an event, string, to a callback function. Passing "all" will bind the callback to all events. Inherited from Backbone.js.
unbind two.unbind(event, callback);
Remove one or many callback functions. If callback is null it removes all callbacks for an event. If the event name is null, all callback functions for the instance are removed. This is highly discouraged. Inherited from Backbone.js.


*/


var instances = [];
var ticker = dom.getRequestAnimationFrame(() => {
  for (var i = 0; i < instances.length; i++) {
    var t = instances[i];
    if (t.playing) { t.update(); }
  }
});

/**
 * Properly defer play calling until after all objects
 * have been updated with their newest styles.
 */
var setPlaying = function(b) {
  this.playing = !!b;
  return this;
};


/**
 * @class
 */



function dropUndefinedProperties(obj) {
  Object.keys({fullscreen, width, height, type, autostart}).re

}

Shape.Identifier = 'two_';

class Two {

  constructor({fullscreen, width, height, type, autostart,}) {


    this.dispatcher = new EventEmitter(Object.keys(TwoEvent));

    // Determine what Renderer to use and setup a scene.

    var params = _.defaults({fullscreen, width, height, type, autostart}, TwoDefaults);
    console.log(params)

    _.each(params, function(v, k) {
      if (k === 'fullscreen' || k === 'autostart') {
        return;
      }
      this[k] = v;
    }, this);

    // Specified domElement overrides type declaration only if the element does not support declared renderer type.
    if (dom.isElement(params.domElement)) {
      var tagName = params.domElement.tagName.toLowerCase();
      // TODO: Reconsider this if statement's logic.
      if (!/^(CanvasRenderer-canvas|WebGLRenderer-canvas|SVGRenderer-svg)$/.test(this.type+'-'+tagName)) {
        this.type = RendererTypes[tagName];
      }
    }

    this.scene = new Group();


    var renderers = {};
    renderers[RendererTypes.webgl]  = './renderer-webgl/Renderer';
    renderers[RendererTypes.canvas] = './renderer-canvas/Renderer';
    renderers[RendererTypes.svg]    = './renderer-svg/Renderer';
    var Renderer = require(renderers[this.type]).default;

    this.renderer = new Renderer(this);
    setPlaying.call(this, params.autostart);
    this.frameCount = 0;

    if (params.fullscreen) {

      var fitted = _.bind(fitToWindow, this);
      document.body.style= Object.assign(document.body.style, {
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'fixed'
      });
      this.renderer.domElement.style = Object.assign(this.renderer.domElement.style, {
        display: 'block',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'fixed'
      });
      dom.bind(root, 'resize', fitted);
      fitted();


    } else if (!dom.isElement(params.domElement)) {

      this.renderer.setSize(params.width, params.height, this.ratio);
      this.width = params.width;
      this.height = params.height;

    }

    instances.push(this);
    ticker.init();
  }

  whenPlayed() {
    this.dispatcher.emit(TwoEvent.play);
  }
  whenPaused() {
    this.dispatcher.emit(TwoEvent.pause);
  }
  whenUpdated() {
    this.dispatcher.emit(TwoEvent.update, this.frameCount, this.timeDelta);
  }
  whenRendered() {
    this.dispatcher.emit(TwoEvent.render, this.frameCount);
  }
  whenResized(width, height) {
    this.dispatcher.emit(TwoEvent.resize, this.width, this.height);
  }


  appendTo(elem) {
    elem.appendChild(this.renderer.domElement);
    return this;
  }

  play() {
    setPlaying.call(this, true);
    this.whenPlayed();
  }

  pause() {
    this.playing = false;
    whenPaused();
  }

  /**
   * Update positions and calculations in one pass before rendering.
   */
  update() {

    var animated = !!this._lastFrame;
    var now = perf.now();

    this.frameCount++;

    if (animated) {
      this.timeDelta = parseFloat((now - this._lastFrame).toFixed(3));
    }
    this._lastFrame = now;

    var width = this.width;
    var height = this.height;
    var renderer = this.renderer;

    // Update width / height for the renderer
    if (width !== renderer.width || height !== renderer.height) {
      renderer.setSize(width, height, this.ratio);
    }

    this.whenUpdated();

    return this.render();

  }

  /**
   * Render all drawable - visible objects of the scene.
   */
  render() {

    this.renderer.render();
    this.whenRendered(this.frameCount);
  }

  /**
   * Convenience Methods
   */

  add(o) {

    var objects = o;
    if (!(objects instanceof Array)) {
      objects = Array.from(arguments);
    }

    this.scene.add(objects);
    return this;

  }

  remove(o) {

    var objects = o;
    if (!(objects instanceof Array)) {
      objects = Array.from(arguments);
    }

    this.scene.remove(objects);

    return this;

  }

  clear() {
    this.scene.remove(Array.from(this.scene.children));
    return this;
  }

  /**
   * Convenience methods to add to the scene various shape types
   */
   makeGroup(objects) {
     var gp = factories.makeGroup();
     this.scene.add(gp);
     if (!(objects instanceof Array)) {
       objects = Array.from(arguments);
     }
     gp.add(objects);
     return gp;
   }

  makeCurve(p) {
    var pth = factories.makeCurve(p);
    factories.centerPath(pth); // :WARN: consider making this optional as make this optional
    this.scene.add(pth);
    return pth;
  }
  makePath(p) {
    var pth = factories.makePath(p);
    factories.centerPath(pth); // :WARN: consider making this optional as make this optional
    this.scene.add(pth);
    return pth;
  }
  makeText(...args) {
    var txt = factories.makeText(...args);
    this.add(txt);
    return txt;
  }
  makeLinearGradient(x1, y1, x2, y2, ...stops) {
    var gradient = factories.makeLinearGradient(x1, y1, x2, y2, stops);
    this.add(gradient);
    return gradient;
  }
  makeRadialGradient(x1, y1, r, ...stops) {
    var gradient = factories.makeRadialGradient(x1,y1,r,stops);
    this.add(gradient);
    return gradient;
  }

  /**
   * Draws a custom geometry to the instance's drawing space.
   * Geometries defined as a Path
   */
  addGeometry({points, translation, rotation}) {
    var pth = factories.makeGeometry(points);
    pth.translation.set(...translation);
    if(rotation) { pth.rotation = rotation; }
    this.scene.add(pth);
    return pth;
  }



  /**
   * Interpret an SVG Node and add it to this instance's scene. The
   * distinction should be made that this doesn't `import` svg's, it solely
   * interprets them into something compatible for Two.js — this is slightly
   * different than a direct transcription.
   *
   * @param {Object} svgNode - The node to be parsed
   * @param {Boolean} shallow - Don't create a top-most group but
   *                                    append all contents directly
   */
  interpret(svgNode, shallow) {
    var {interpret} = require('./import/import-svg');
    var {node, shape} = interpret(svgNode, shallow);
    this.add(shape);
    return node;
  }

  /**
   * Load an SVG file / text and interpret.
   */
  load(text, callback) {
    var {load} = require('./import/import-svg');
    load(text, (nodes) => {
      nodes.forEach((node) => {
        // this.add(shape);
      });
    });
    return this;
  }
}

Two.Version = 'v0.7.0',



function fitToWindow() {

  var {width, height} = dom.getWindowSize();

  this.width = width;
  this.height = height;

  this.renderer.setSize(width, height, this.ratio);
  this.whenResized();

}


// Not in use
/**
     * Release an arbitrary class' events from the two.js corpus and recurse
     * through its children and or vertices.
     */
    /*
    var release = (obj) => {

      if (!is.Object(obj)) {
        return;
      }

      if (isFunction(obj.unbind)) {
        obj.unbind();
      }

      if (obj.vertices) {
        if (isFunction(obj.vertices.unbind)) {
          obj.vertices.unbind();
        }
        _.each(obj.vertices, function(v) {
          if (isFunction(v.unbind)) {
            v.unbind();
          }
        });
      }

      if (obj.children) {
        _.each(obj.children, function(obj) {
          FN.release(obj);
        });
      }

    }


    */

export default Two;
