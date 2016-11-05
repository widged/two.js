/* jshint esnext: true */

import base from './base';
import shapeRendering   from '../../renderer-lib/renderer-bridge';

var {isCanvasContext} = base;
var {getShapeProps, getShapeRenderer, updateShape, anyPropChanged} = shapeRendering;

var radialGradient = {

  render: function(shp, canvasContext) {
    // :TODO: either WebGLRenderingContent or CanvasContext2D... track down why
    if (!isCanvasContext(canvasContext)) { return; }

    updateShape(shp);

    var renderer = getShapeRenderer(shp);

    if (!renderer.gradient  || anyPropChanged(shp, ['center','focal','radius','stops']) ) {

      var {center, focal, radius, stops} = getShapeProps(shp, ['center','focal','radius','stops']);
      var {x: cx,y: cy} = getShapeProps(center, ['x','y']);
      var {x: fx,y: fy} = getShapeProps(focal, ['x','y']);
      renderer.gradient = canvasContext.createRadialGradient( cx, cy, 0, fx, fy, radius );

      for (var i = 0, ni = stops.length, di = null; i < ni; i++) {
        di = stops[i];
        renderer.gradient.addColorStop(di.offset, di.color);
      }

    }

    return shp.flagReset();

  }

};

export default radialGradient;
