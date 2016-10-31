/* jshint esnext: true */

import is  from '../util/is';

/**
 * Cross browser dom events.
 */

var {isFunction} = is;

var dom = {};

dom.temp = (document ? document.createElement('div') : {});

dom.isElement = (obj) =>  {
  return !!(obj && obj.nodeType === 1);
};

dom.hasEventListeners = isFunction(global.addEventListener);

dom.onWindowResize = function(func, bool) {
  var elem = document;
  if (dom.hasEventListeners) {
    elem.addEventListener('resize', func, !!bool);
  } else {
    elem.attachEvent('onresize', func);
  }
  return dom;
};





dom.getWindowSize = () => {
  return document.body.getBoundingClientRect();
};

/**
 * Account for high dpi rendering.
 * http://www.html5rocks.com/en/tutorials/canvas/hidpi/
 */
dom.getRatio = function(ctx) {
  var deviceRatio = global.devicePixelRatio || 1;
  var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio || deviceRatio;

  return deviceRatio / backingStoreRatio;
};

dom.removeChildNodes = (node) => {
  while (node.firstChild) {
      node.removeChild(node.firstChild);
  }
}


export default dom;
