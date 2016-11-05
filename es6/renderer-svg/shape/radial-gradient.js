/* jshint esnext: true */

import shapeRendering   from '../../renderer-lib/renderer-bridge';
import svgFN    from './fn-svg';

var {getShapeProps, getShapeRenderer, updateShape, anyPropChanged} = shapeRendering;
var {createElement, setAttributes} = svgFN;

var renderElement = (parentNode, nodeType, attrs, defs) => {
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

var radialGradient = function(shp, domElement) {

  updateShape(shp);

  var changed = {};
  var renderer = getShapeRenderer(shp);


  if ( anyPropChanged(shp, ['center','focal','radius','stops']) ) {
    var {center, focal, radius, stops} = getShapeProps(shp, ['center','focal','radius','stops']);
    var {x: cx,y: cy} = getShapeProps(center, ['x','y']);
    var {x: fx,y: fy} = getShapeProps(focal, ['x','y']);

    renderer.elem = renderElement(
      renderer.elem, 'radialGradient',
      {id: shp.id, gradientUnits: 'userSpaceOnUse', cx, cy, fx, fy, r:radius},
      domElement.defs
    );

    if (true || anyPropChanged(shp, ['stops'] ) ) {

      svgFN.clear(renderer.elem);

      for (var i = 0; i < stops.length; i++) {
        var stop = stops[i];
        if( anyPropChanged(stop, ['offset','color','opacity']) ) {
          var {offset, color, opacity} = getShapeProps(['offset','color','opacity']);
          var stopRenderer = getShapeRenderer(stop);
          stopRenderer.elem = renderElement(
            stopRenderer.elem, 'stop',
            {offset: (100 * offset) + '%', 'stop-color': color, 'stop-opacity': opacity}
          );

          renderer.elem.appendChild(stopRenderer.elem);
        }

      }

    }

  }

  return shp.flagReset();

};

export default radialGradient;
