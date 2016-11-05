/* jshint esnext: true */

import svgFN    from './fn-svg';
import shapeRendering   from '../../renderer-lib/renderer-bridge';

var {createElement, setAttributes} = svgFN;
var {anyPropChanged, getShapeProps, getShapeRenderer} = shapeRendering;

var renderLinearGradient = (shp, domElement) => {

  var shapeProps = getShapeProps(shp);

  var attrs = {};

  if (anyPropChanged(shp, ['endPoints'])) {
    attrs.x1 = shp.left.x;
    attrs.y1 = shp.left.y;
    attrs.x2 = shp.right.x;
    attrs.y2 = shp.right.y;
  }

  if (anyPropChanged(shp, ['spread'])) {
    var {spread} = shapeProps;
    attrs.spreadMethod = spread;
  }

  var renderer = getShapeRenderer(shp);
  // If there is no attached DOM element yet,
  // create it with all necessary attributes.
  attrs.id = shp.id;
  attrs.gradientUnits = 'userSpaceOnUse';

  if (!renderer.elem) {
    renderer.elem = createElement('linearGradient', attrs);
    domElement.defs.appendChild(renderer.elem);
  // Otherwise apply all pending attributes
  } else {
    setAttributes(renderer.elem, attrs);
  }

  if (!renderer.gradient || anyPropChanged(shp, ['stops', 'endPoints'])) {
    svgFN.clear(renderer.elem);
    var { stops, left, right } = shapeProps;
    var {x: x1, y: y1} = left  || {x: 0, y: 0};
    var {x: x2, y: y2} = right || {x: 0, y: 0};

    for (var i = 0, ni = stops.length, stop, stopRenderer, stopNode; i < ni; i++) {
      stop = stops[i];
      var {offset, color, opacity} = getShapeProps(stop, ['offset','color','opacity']);
      stopRenderer = getShapeRenderer(stop);
      stopNode = svgFN.createGradientStop(stopRenderer.elem, offset, color, opacity);
      stopRenderer.elem = stopNode;
      renderer.elem.appendChild(stopNode);
    }
  }

  return shp.flagReset();

};


export default renderLinearGradient;
