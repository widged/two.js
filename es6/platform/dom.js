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


dom.hasEventListeners = isFunction(root.addEventListener);

dom.bind = function(elem, event, func, bool) {
  if (this.hasEventListeners) {
    elem.addEventListener(event, func, !!bool);
  } else {
    elem.attachEvent('on' + event, func);
  }
  return dom;
};

dom.unbind= function(elem, event, func, bool) {
  if (dom.hasEventListeners) {
    elem.removeEventListeners(event, func, !!bool);
  } else {
    elem.detachEvent('on' + event, func);
  }
  return dom;
};

dom.getRequestAnimationFrame = function(onTick) {

  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  var request, cancel;

  for (var i = 0; i < vendors.length; i++) {
    request = global[vendors[i] + 'RequestAnimationFrame'] || request;
    cancel = global[vendors[i] + 'CancelAnimationFrame']
      || global[vendors[i] + 'CancelRequestAnimationFrame'] || cancel;
  }

  request = request || function(callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = global.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
  // cancel = cancel || function(id) {
  //   clearTimeout(id);
  // };

  function recurse() {
    // console.log('loop')
    onTick()
    request(recurse);
  }

  request.init = () => {
    recurse();
  }

  return request;

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
    ctx.backingStorePixelRatio || 1;

  return deviceRatio / backingStoreRatio;
};

dom.removeChildNodes = (node) => {
  while (node.firstChild) {
      node.removeChild(node.firstChild);
  }
}


export default dom;