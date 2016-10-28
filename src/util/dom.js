'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscore = require('./underscore');

var _underscore2 = _interopRequireDefault(_underscore);

/**
   * Cross browser dom events.
   */

var dom = {

  temp: document ? document.createElement('div') : {},

  hasEventListeners: _underscore2['default'].isFunction(root.addEventListener),

  bind: function bind(elem, event, func, bool) {
    if (this.hasEventListeners) {
      elem.addEventListener(event, func, !!bool);
    } else {
      elem.attachEvent('on' + event, func);
    }
    return dom;
  },

  unbind: function unbind(elem, event, func, bool) {
    if (dom.hasEventListeners) {
      elem.removeEventListeners(event, func, !!bool);
    } else {
      elem.detachEvent('on' + event, func);
    }
    return dom;
  },

  getRequestAnimationFrame: function getRequestAnimationFrame(onTick) {

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    var request, cancel;

    for (var i = 0; i < vendors.length; i++) {
      request = root[vendors[i] + 'RequestAnimationFrame'] || request;
      cancel = root[vendors[i] + 'CancelAnimationFrame'] || root[vendors[i] + 'CancelRequestAnimationFrame'] || cancel;
    }

    request = request || function (callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = root.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
    // cancel = cancel || function(id) {
    //   clearTimeout(id);
    // };

    function recurse() {
      // console.log('loop')
      onTick();
      request(recurse);
    }

    request.init = function () {
      recurse();
    };

    return request;
  }

};

dom.getWindowSize = function () {
  return document.body.getBoundingClientRect();
};

exports['default'] = dom;
module.exports = exports['default'];