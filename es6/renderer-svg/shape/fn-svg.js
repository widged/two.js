/* jshint esnext: true */

import dom   from '../../platform/dom';

var FN = {};

/**
 * Create an svg namespaced element.
 */
FN.createElement = function(name, attrs) {
  // var xlink = 'http://www.w3.org/1999/xlink';
  var tag = name;
  var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
  dom.setAttributes(elem, attrs);
  return elem;
};

FN.setAttributes = dom.setAttributes;

FN.clear = (node) => {
  dom.removeChildNodes(node);
};


/**
 *
 */
FN.getClip = function(shape) {
  var {createElement} = FN;
  var clip = shape._renderer.clip;

  if (!clip) {
    var root = shape;
    while (root.parent) { root = root.parent; }
    clip = shape._renderer.clip = createElement('clipPath');
    root.defs.appendChild(clip);
  }

  return clip;
};


export default FN;
