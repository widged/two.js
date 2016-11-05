/* jshint esnext: true */

import base from './base';
import shapeRendering   from '../../renderer-lib/renderer-bridge';

var {isCanvasContext} = base;
var {getShapeProps, getShapeRenderer, anyPropChanged} = shapeRendering;


var renderLinearGradient = (shp, canvasContext, elem) => {

  var shapeProps = getShapeProps(shp);

  // context can be canvas or webgl... webgl when elem is WebGL program
  if (!isCanvasContext(canvasContext)) { return; }

  var renderer = getShapeRenderer(shp);

  if (!renderer.gradient  || anyPropChanged(shp, ['endPoints','stops']) ) {

    var { stops, left, right } = shapeProps;
    var {x: x1, y: y1} = left  || {x: 0, y: 0};
    var {x: x2, y: y2} = right || {x: 0, y: 0};
    renderer.gradient = canvasContext.createLinearGradient( x1, y1, x2, y2 );

    for (var i = 0, ni = stops.length; i < ni; i++) {
      var {offset, color} = getShapeProps(stops[i], ['offset','color']);
      renderer.gradient.addColorStop(offset, color);
    }

  }

  return shp.flagReset();

};

export default renderLinearGradient;
