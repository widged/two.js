/* jshint esnext: true */

import base from './base';
import rendererBridge   from '../../renderer/renderer-bridge';

var {isCanvasContext} = base;
var {getShapeProps, getShapeRenderer, anyPropChanged} = rendererBridge;

var renderRadialGradient = (shp, canvasContext) => {

  var shapeProps = getShapeProps(shp);

  // :TODO: either WebGLRenderingContent or CanvasContext2D... track down why
  if (!isCanvasContext(canvasContext)) { return; }

  var renderer = getShapeRenderer(shp);

  if (!renderer.gradient  || anyPropChanged(shp, ['center','focal','radius','stops']) ) {

    var {center, focal, radius, stops} = shapeProps;
    var {x : cx, y : cy} = center || {x: 0, y: 0};
    var {x : fx, y : fy} = focal  || {x: 0, y: 0};
    renderer.gradient = canvasContext.createRadialGradient( cx, cy, 0, fx, fy, radius );

    for (var i = 0, ni = stops.length; i < ni; i++) {
      var {offset, color} = getShapeProps(stops[i], ['offset','color']);
      renderer.gradient.addColorStop(offset, color);
    }

  }

  return shp.flagReset();

};

export default renderRadialGradient;
