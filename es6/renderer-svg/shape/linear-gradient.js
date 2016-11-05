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

  if (anyPropChanged(shp, ['stops'])) {
    var {stops} = shapeProps;
    svgFN.clear(renderer.elem);

    for (var i = 0; i < stops.length; i++) {

      var stop = stops[i];
      var sAttrs = {};

      if (anyPropChanged(stop, ['offset','color','opacity'])) {
        var {offset,color,opacity} = getShapeProps(stop, ['offset','color','opacity']);
        sAttrs.offset = 100 * offset + '%';
        sAttrs['stop-color'] = color;
        sAttrs['stop-opacity'] = opacity;
      }

      var stopRenderer = getShapeRenderer(stop);
      if (!stopRenderer.elem) {
        stopRenderer.elem = createElement('stop', sAttrs);
      } else {
        setAttributes(stopRenderer.elem, sAttrs);
      }

      renderer.elem.appendChild(stopRenderer.elem);

    }

  }

  return shp.flagReset();

};


export default renderLinearGradient;
