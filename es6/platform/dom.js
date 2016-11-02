/* jshint esnext: true */

import is  from '../util/is';

/**
 * Cross browser dom events.
 */

var {isFunction} = is;

var FN = {};

FN.temp = (document ? document.createElement('div') : {});


FN.hasEventListeners = isFunction(global.addEventListener);

FN.onWindowResize = function(func, bool) {
  var {hasEventListeners} = FN;
  var elem = window;
  if (hasEventListeners) {
    elem.addEventListener('resize', func, !!bool);
  } else {
    elem.attachEvent('onresize', func);
  }
  return elem;
};

FN.updateDomNodeSize = (domElement, width, height, ratio) => {
  domElement.width =  width * ratio;
  domElement.height = height * ratio;
  domElement.style = Object.assign(domElement.style, {
    width: width + 'px',
    height: height + 'px'
  });
};

FN.nodeType = (node) => {
  // check if node is element
  if (!(node && node.nodeType === 1)) { return; }
  return node.tagName.toLowerCase();
};


FN.getWindowSize = () => {
  return document.body.getBoundingClientRect();
};


FN.getDeviceRatio = () => {
  return window.devicePixelRatio || 1;
};

/**
 * Account for high dpi rendering.
 * http://www.html5rocks.com/en/tutorials/canvas/hidpi/
 */
FN.getCanvasContextRatio = function(context) {
  return context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio;
};

FN.removeChildNodes = (node) => {
  while (node.firstChild) {
      node.removeChild(node.firstChild);
  }
};


/**
 * Add attributes from an svg element.
 */
FN.setAttributes = function(elem, attrs) {
  if (!attrs || Object.keys(attrs).length === 0) { return; }
  var keys = Object.keys(attrs);
  for (var i = 0; i < keys.length; i++) {
    elem.setAttribute(keys[i], attrs[keys[i]]);
  }
};

/**
 * Remove attributes from an svg element.
 */
FN.removeAttributes = function(elem, attrs) {
  for (var key in attrs) {
    elem.removeAttribute(key);
  }
  return this;
};


export default FN;
