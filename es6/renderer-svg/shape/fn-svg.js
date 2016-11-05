/* jshint esnext: true */

import dom   from '../../platform/dom';
import shapeRendering   from '../../renderer-bridge';

var {getShapeRenderer} = shapeRendering;

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
FN.getClip = function(shp) {
  var {createElement} = FN;
  var renderer = getShapeRenderer(shp);
  var clipR = renderer.clip;

  if (!clipR) {
    var root = shp;
    while (root.parent) {
      root = root.parent;
     }
    clipR = renderer.clip = createElement('clipPath');
    root.defs.appendChild(clipR);
  }

  return clipR;
};


export default FN;
