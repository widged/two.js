/* jshint esnext: true */

import dom   from '../../platform/dom';
import shapeRendering   from '../../renderer-lib/renderer-bridge';

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

FN.createGradientStop = (node, offset, color, opacity) => {
  let {createElement, setAttributes} = FN;
  if (!node) { node = createElement('stop'); }
  setAttributes( node, {
    offset : 100 * offset + '%',
    'stop-color': color,
    'stop-opacity': opacity
  });
  return node;
};

FN.renderNode = (parentNode, nodeType, attrs, defs) => {
  var {createElement, setAttributes} = FN;
  // If there is no attached DOM element yet, create it with all necessary attributes.
  if (!parentNode) {
    parentNode = createElement(nodeType, attrs);
    if(defs) { defs.appendChild(parentNode); }
  // Otherwise apply all pending attributes
  } else {
    setAttributes(parentNode, attrs);
  }
  return parentNode;
};

export default FN;
