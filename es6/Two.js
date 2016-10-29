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

var EventTypes = require('./constant/EventTypes').default;
var RendrererTypes = require('./constant/RendererTypes').default;
var is     = require('./util/is').default;
var _     = require('./util/common').default;
var EventDecorators = require('./util/emitter-decorator').default;
var dom   = require('./platform/dom').default;
var perf  = require('./platform/Performance').default;
var Anchor = require('./Anchor').default;
var Group = require('./shape/Group').default;
var Path  = require('./shape/Path').default;
var RadialGradient  = require('./gradient/RadialGradient').default;
var LinearGradient  = require('./gradient/LinearGradient').default;
var Text  = require('./shape/Text').default;

var root = this;

var {isNumber, isArray} = is;

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
}


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
  if (dom.isElement(params.domElement)) {
    var tagName = params.domElement.tagName.toLowerCase();
    // TODO: Reconsider this if statement's logic.
    if (!/^(CanvasRenderer-canvas|WebGLRenderer-canvas|SVGRenderer-svg)$/.test(this.type+'-'+tagName)) {
      this.type = RendrererTypes[tagName];
    }
  }

  this.scene = new Group();


  var renderers = {};
  renderers[RendrererTypes.webgl]  = './renderer-webgl/Renderer';
  renderers[RendrererTypes.canvas] = './renderer-canvas/Renderer';
  renderers[RendrererTypes.svg]    = './renderer-svg/Renderer';
  var Renderer = require(renderers[this.type]).default;
  
  this.renderer = new Renderer(this);
  setPlaying.call(this, params.autostart);
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


  } else if (!dom.isElement(params.domElement)) {

    this.renderer.setSize(params.width, params.height, this.ratio);
    this.width = params.width;
    this.height = params.height;

  }

  instances.push(this);
  ticker.init();
};

Two.Version = 'v0.7.0',


_.extend(Two.prototype, EventDecorators, {

  appendTo: function(elem) {
    console.log(this.renderer)
    elem.appendChild(this.renderer.domElement);
    return this;

  },

  play: function() {

    setPlaying.call(this, true);
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
    if (!isArray(p)) {
      points = [];
      for (var i = 0; i < l; i+=2) {
        var x = arguments[i];
        if (!isNumber(x)) {
          break;
        }
        var y = arguments[i + 1];
        points.push(new Anchor(x, y));
      }
    }

    var last = arguments[l - 1];
    var curve = new Path(points, !(is.isBoolean(last) ? last : undefined), true);
    var rect = curve.getBoundingClientRect();
    curve.center().translation
      .set(rect.left + rect.width / 2, rect.top + rect.height / 2);

    this.scene.add(curve);

    return curve;

  },

  /**
   * Convenience method to make and draw a Path.
   */
  makePath: function(p) {

    var l = arguments.length, points = p;
    if (!isArray(p)) {
      points = [];
      for (var i = 0; i < l; i+=2) {
        var x = arguments[i];
        if (!isNumber(x)) {
          break;
        }
        var y = arguments[i + 1];
        points.push(new Anchor(x, y));
      }
    }

    var last = arguments[l - 1];
    var path = new Path(points, !(is.isBoolean(last) ? last : undefined));
    var rect = path.getBoundingClientRect();
    path.center().translation
      .set(rect.left + rect.width / 2, rect.top + rect.height / 2);

    this.scene.add(path);

    return path;

  },

  /**
   * Convenience method to make and add a Text.
   */
  makeText: function(message, x, y, styles) {
    var text = new Text(message, x, y, styles);
    this.add(text);
    return text;
  },

  /**
   * Convenience method to make and add a LinearGradient.
   */
  makeLinearGradient: function(x1, y1, x2, y2 /* stops */) {
    var slice = _.natural.slice;
    var stops = slice.call(arguments, 4);
    var gradient = new LinearGradient(x1, y1, x2, y2, stops);

    this.add(gradient);

    return gradient;

  },

  /**
   * Convenience method to make and add a RadialGradient.
   */
  makeRadialGradient: function(x1, y1, r /* stops */) {
    var slice = _.natural.slice;
    var stops = slice.call(arguments, 3);
    var gradient = new RadialGradient(x1, y1, r, stops);

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
    var read = require('./import/import-svg');

    var tag = svgNode.tagName.toLowerCase();

    if (!(tag in read)) {
      return null;
    }

    var node = read[tag].call(this, svgNode);

    var shape;
    if (shallow && node instanceof Group) {
      shape = node.children;
    } else {
      shape = node;
    }

    this.add(shape);

    return node;

  },

  /**
   * Load an SVG file / text and interpret.
   */
  load: function(text, callback) {

    var nodes = [], elem, i;

    if (/.*\.svg/ig.test(text)) {
      var xhr = require('./platform/xhr').default;

      xhr(text, _.bind(function(data) {

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