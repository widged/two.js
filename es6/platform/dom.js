/* jshint esnext: true */

import is  from '../util/is';

/**
 * Cross browser dom events.
 */

var {isFunction} = is;

var FN = {};

FN.temp = (document ? document.createElement('div') : {});

FN.isElement = (obj) =>  {
  return !!(obj && obj.nodeType === 1);
};

FN.hasEventListeners = isFunction(global.addEventListener);

FN.onWindowResize = function(func, bool) {
  var elem = document;
  if (dom.hasEventListeners) {
    elem.addEventListener('resize', func, !!bool);
  } else {
    elem.attachEvent('onresize', func);
  }
  return dom;
};

FN.updateDomNodeSize = (domElement, width, height, ratio) => {
  domElement.width =  width * ratio;
  domElement.height = height * ratio;
  domElement.style = Object.assign(domElement.style, {
    width: width + 'px',
    height: height + 'px'
  });
};

FN.getWindowSize = () => {
  return document.body.getBoundingClientRect();
};

/**
 * Account for high dpi rendering.
 * http://www.html5rocks.com/en/tutorials/canvas/hidpi/
 */
FN.getRatio = function(ctx) {
  var deviceRatio = global.devicePixelRatio || 1;
  var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio || deviceRatio;

  return deviceRatio / backingStoreRatio;
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
