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

var EventTypes = require('./constants/EventTypes').default;
var RendrererTypes = require('./constants/RendererTypes').default;
var _     = require('./utils/underscore').default;
var EventDecorators = require('./utils/eventsDecorator').default;
var Utils = require('./utils/utils').default;
var dom   = require('./utils/dom').default;
var perf  = require('./Performance').default;
var Anchor = require('./Anchor').default;
var Group = require('./shape/Group').default;
var Path  = require('./shape/Path').default;

var root = this;

var instances = [];
var ticker = dom.getRequestAnimationFrame(() => {
  for (var i = 0; i < instances.length; i++) {
    var t = instances[i];
    if (t.playing) { t.update(); }
  }
});

/**
 * @class
 */
var Two = function(options) {

  // Determine what Renderer to use and setup a scene.
  // 

  var params = _.defaults(options || {}, {
    fullscreen: false,
    width: 640,
    height: 480,
    type: RendrererTypes.svg,
    autostart: false
  });

  _.each(params, function(v, k) {
    if (k === 'fullscreen' || k === 'autostart') {
      return;
    }
    this[k] = v;
  }, this);

  // Specified domElement overrides type declaration only if the element does not support declared renderer type.
  if (_.isElement(params.domElement)) {
    var tagName = params.domElement.tagName.toLowerCase();
    // TODO: Reconsider this if statement's logic.
    if (!/^(CanvasRenderer-canvas|WebGLRenderer-canvas|SVGRenderer-svg)$/.test(this.type+'-'+tagName)) {
      this.type = RendrererTypes[tagName];
    }
  }

  var renderers = {};
  renderers[RendrererTypes.webgl]  = './renderer/Webgl';
  renderers[RendrererTypes.canvas] = './renderer/Canvas';
  renderers[RendrererTypes.svg]    = './renderer/Svg';
  var Renderer = require(renderers[this.type]).default;
   
  this.renderer = new Renderer(this);
  Utils.setPlaying.call(this, params.autostart);
  this.frameCount = 0;

  if (params.fullscreen) {

    var fitted = _.bind(fitToWindow, this);
    _.extend(document.body.style, {
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      position: 'fixed'
    });
    _.extend(this.renderer.domElement.style, {
      display: 'block',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      position: 'fixed'
    });
    dom.bind(root, 'resize', fitted);
    fitted();


  } else if (!_.isElement(params.domElement)) {

    this.renderer.setSize(params.width, params.height, this.ratio);
    this.width = params.width;
    this.height = params.height;

  }

  this.scene = this.renderer.scene;

  instances.push(this);
  ticker.init();
};

Two.Version = 'v0.7.0',


_.extend(Two.prototype, EventDecorators, {

  appendTo: function(elem) {

    elem.appendChild(this.renderer.domElement);
    return this;

  },

  play: function() {

    Utils.setPlaying.call(this, true);
    return this.trigger(EventTypes.play);

  },

  pause: function() {

    this.playing = false;
    return this.trigger(EventTypes.pause);

  },

  /**
   * Update positions and calculations in one pass before rendering.
   */
  update: function() {

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

    this.trigger(EventTypes.update, this.frameCount, this.timeDelta);

    return this.render();

  },

  /**
   * Render all drawable - visible objects of the scene.
   */
  render: function() {

    this.renderer.render();
    return this.trigger(EventTypes.render, this.frameCount);

  },

  /**
   * Convenience Methods
   */

  add: function(o) {

    var objects = o;
    if (!(objects instanceof Array)) {
      objects = _.toArray(arguments);
    }

    this.scene.add(objects);
    return this;

  },

  remove: function(o) {

    var objects = o;
    if (!(objects instanceof Array)) {
      objects = _.toArray(arguments);
    }

    this.scene.remove(objects);

    return this;

  },

  clear: function() {

    this.scene.remove(_.toArray(this.scene.children));
    return this;

  },

  addShape: function({points, translation, rotation}) {
    var pth = new Path();
    Path.MakeObservable(pth);
    points = points.map((d) => {  return new Anchor(...d); })
    Path.call(pth, points, true);
    pth.translation.set(...translation);
    if(rotation) { pth.rotation = rotation; };
    this.scene.add(pth);
    return pth;
  },


  makeCurve: function(p) {

    var l = arguments.length, points = p;
    if (!_.isArray(p)) {
      points = [];
      for (var i = 0; i < l; i+=2) {
        var x = arguments[i];
        if (!_.isNumber(x)) {
          break;
        }
        var y = arguments[i + 1];
        points.push(new Two.Anchor(x, y));
      }
    }

    var last = arguments[l - 1];
    var curve = new Two.Path(points, !(_.isBoolean(last) ? last : undefined), true);
    var rect = curve.getBoundingClientRect();
    curve.center().translation
      .set(rect.left + rect.width / 2, rect.top + rect.height / 2);

    this.scene.add(curve);

    return curve;

  },

  /**
   * Convenience method to make and draw a Two.Path.
   */
  makePath: function(p) {

    var l = arguments.length, points = p;
    if (!_.isArray(p)) {
      points = [];
      for (var i = 0; i < l; i+=2) {
        var x = arguments[i];
        if (!_.isNumber(x)) {
          break;
        }
        var y = arguments[i + 1];
        points.push(new Two.Anchor(x, y));
      }
    }

    var last = arguments[l - 1];
    var path = new Two.Path(points, !(_.isBoolean(last) ? last : undefined));
    var rect = path.getBoundingClientRect();
    path.center().translation
      .set(rect.left + rect.width / 2, rect.top + rect.height / 2);

    this.scene.add(path);

    return path;

  },

  /**
   * Convenience method to make and add a Two.Text.
   */
  makeText: function(message, x, y, styles) {
    var text = new Two.Text(message, x, y, styles);
    this.add(text);
    return text;
  },

  /**
   * Convenience method to make and add a Two.LinearGradient.
   */
  makeLinearGradient: function(x1, y1, x2, y2 /* stops */) {
    var slice = _.natural.slice;
    var stops = slice.call(arguments, 4);
    var gradient = new Two.LinearGradient(x1, y1, x2, y2, stops);

    this.add(gradient);

    return gradient;

  },

  /**
   * Convenience method to make and add a Two.RadialGradient.
   */
  makeRadialGradient: function(x1, y1, r /* stops */) {
    var slice = _.natural.slice;
    var stops = slice.call(arguments, 3);
    var gradient = new Two.RadialGradient(x1, y1, r, stops);

    this.add(gradient);

    return gradient;

  },

  makeGroup: function(o) {

    var objects = o;
    if (!(objects instanceof Array)) {
      objects = _.toArray(arguments);
    }

    var group = new Group();
    this.scene.add(group);
    group.add(objects);

    return group;

  },

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
  interpret: function(svgNode, shallow) {

    var tag = svgNode.tagName.toLowerCase();

    if (!(tag in Utils.read)) {
      return null;
    }

    var node = Utils.read[tag].call(this, svgNode);

    if (shallow && node instanceof Group) {
      this.add(node.children);
    } else {
      this.add(node);
    }

    return node;

  },

  /**
   * Load an SVG file / text and interpret.
   */
  load: function(text, callback) {

    var nodes = [], elem, i;

    if (/.*\.svg/ig.test(text)) {

      Utils.xhr(text, _.bind(function(data) {

        dom.temp.innerHTML = data;
        for (i = 0; i < dom.temp.children.length; i++) {
          elem = dom.temp.children[i];
          nodes.push(this.interpret(elem));
        }

        callback(nodes.length <= 1 ? nodes[0] : nodes,
          dom.temp.children.length <= 1 ? dom.temp.children[0] : dom.temp.children);

      }, this));

      return this;

    }

    dom.temp.innerHTML = text;
    for (i = 0; i < dom.temp.children.length; i++) {
      elem = dom.temp.children[i];
      nodes.push(this.interpret(elem));
    }

    callback(nodes.length <= 1 ? nodes[0] : nodes,
      dom.temp.children.length <= 1 ? dom.temp.children[0] : dom.temp.children);

    return this;

  }

});

function fitToWindow() {

  var {width, height} = dom.getWindowSize();

  this.width = width;
  this.height = height;

  this.renderer.setSize(width, height, this.ratio);
  this.trigger(EventTypes.resize, width, height);

}


if (typeof define === 'function' && define.amd) {
  define('two', [], function() {
    return Two;
  });
} else if (typeof module != 'undefined' && module.exports) {
  module.exports = Two;
}


export default Two;