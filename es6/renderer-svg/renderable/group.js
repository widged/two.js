/* jshint esnext: true */

import base from './base';
import svgFN    from './fn-svg';
import rendererBridge   from '../../renderer/renderer-bridge';

var {createElement, setAttributes} = svgFN;
var {renderShape} = base;
var {anyPropChanged, getShapeProps, getShapeMatrix, getShapeRenderer} = rendererBridge;

var renderGroup = (shp, domElement) => {

  var shapeProps = getShapeProps(shp);

  // Shortcut for hidden objects.
  // Doesn't reset the flags, so changes are stored and
  // applied once the object is visible again
  var {opacity} = shapeProps;
  if (opacity === 0 && !anyPropChanged(shp, ['opacity'])) {
    return shp;
  }

  var renderer = getShapeRenderer(shp);

  if (!renderer.elem) {
    renderer.elem = createElement('g', { id: shp.id });
    domElement.appendChild(renderer.elem);
  }

  // _Update styles for the <g>
  var matrix = getShapeMatrix(shp);
  var context = {
    domElement: domElement,
    elem: renderer.elem
  };

  if (matrix.manual || anyPropChanged(shp, ['matrix'])) {
    renderer.elem.setAttribute('transform', 'matrix(' + matrix.toString() + ')');
  }

  var {childrenColl} = shapeProps;
  for (var i = 0, ni = childrenColl.length; i < ni; i++) {
    var child = childrenColl[i];
    renderShape(child, domElement);
  }

  if(anyPropChanged(shp, ['opacity'])) {
    renderer.elem.setAttribute('opacity', opacity);
  }


  if(anyPropChanged(shp, ['additions'])) {
    var {additions} = shp.getState();
    additions.forEach((obj) => { appendChild(renderer.elem, obj); });
  }

  if(anyPropChanged(shp, ['substractions'])) {
    var {substractions} = shp.getState();
    substractions.forEach((obj) => { removeChild(renderer.elem, obj); });
  }

  if (anyPropChanged(shp, ['order'])) {
    shp.childrenColl.forEach((child) => {
      var childR = getShapeRenderer(child);
      renderer.elem.appendChild(childR.elem);
    });
  }

  /**
   * Commented two-way functionality of clips / masks with groups and
   * polygons. Uncomment when this bug is fixed:
   * https://code.google.com/p/chromium/issues/detail?id=370951
   */

/*
   if (anyPropChanged(shp, ['clip'])) {
     var clipElem = getClip(shp);

     var { clip } = shapeProps;

     if (clip) {
       renderer.elem.removeAttribute('id');
       clipElem.setAttribute('id', shp.id);
       clipElem.appendChild(renderer.elem);
     } else {
       clipElem.removeAttribute('id');
       renderer.elem.setAttribute('id', shp.id);
       getShapeRenderer(shp.parent).elem.appendChild(renderer.elem); // TODO: should be insertBefore
     }

   }
   */

  if (anyPropChanged(shp, ['mask'])) {
    var { mask } = shapeProps;
    if (mask) {
      renderer.elem.setAttribute('clip-path', 'url(#' + mask.id + ')');
    } else {
      renderer.elem.removeAttribute('clip-path');
    }
  }

  return shp.flagReset();

};


// TODO: Can speed up.
// TODO: How does this effect a f
var appendChild = function(Relem, shp) {
  var renderer = getShapeRenderer(shp);
  var node = renderer.elem;
  if (!node) { return; }

  var {clip} = getShapeProps(shp);
  var tag = node.nodeName;
  if (!tag || /(radial|linear)gradient/i.test(tag) || clip) {
    return;
  }
  Relem.appendChild(node);
};

var removeChild = function(Relem, shp) {

  var renderer = getShapeRenderer(shp);
  var node = renderer.elem;

  if (!node || node.parentNode != Relem) { return; }

  var tag = node.nodeName;
  if (!tag) { return; }

  // Defer substractions while clipping.
  var {clip} = getShapeProps(shp);
  if (clip) { return; }

  Relem.removeChild(node);

};

export default renderGroup;
