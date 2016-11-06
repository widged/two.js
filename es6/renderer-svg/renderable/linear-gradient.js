/* jshint esnext: true */

import svgFN    from './fn-svg';
import is    from '../../lib/is/is';
import rendererBridge   from '../../renderer/renderer-bridge';

var {isNumber} = is;
var {createElement, setAttributes} = svgFN;
var {anyPropChanged, getShapeProps, getShapeRenderer} = rendererBridge;

var renderLinearGradient = (shp, domElement) => {

  var shapeProps = getShapeProps(shp);

  var attrs = {};

  if (anyPropChanged(shp, ['endPoints'])) {
    var {x1, y1} = shp.left || {};
    if(isNumber(x1) || isNumber(y1)) { attrs.x1 = x1 || 0; attrs.y1 = y1 || 0; }
    var {x2, y2} = shp.right || {};
    if(isNumber(x2) || isNumber(y2)) { attrs.x2 = x2 || 0; attrs.y2 = y2 || 0; }
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

    for (var i = 0, ni = (stops || []).length, stop, stopRenderer, stopNode; i < ni; i++) {
      stop = stops[i];
      var {offset, color, opacity} = getShapeProps(stop, ['offset','color','opacity']);
      stopNode = svgFN.createGradientStop(offset, color, opacity);
      renderer.elem.appendChild(stopNode);
    }
  }

  return shp.flagReset();

};


export default renderLinearGradient;
