/* jshint esnext: true */

import base from './base';
import shapeRendering   from '../../renderer-lib/renderer-bridge';

var {isCanvasContext} = base;
var {getShapeProps, getShapeRenderer, updateShape, anyPropChanged} = shapeRendering;


var linearGradient = {

  render: function(shp, canvasContext, elem) {

    // context can be canvas or webgl... webgl when elem is WebGL program
    if (!isCanvasContext(canvasContext)) { return; }


    updateShape(shp);

    var renderer = getShapeRenderer(shp);

    if (!renderer.gradient  || anyPropChanged(shp, ['endPoints','stops']) ) {

      var {left, right, stops} = getShapeProps(shp, ['left','right','stops']);
      var {x: lx,y: ly} = getShapeProps(left, ['x','y']);
      var {x: rx,y: ry} = getShapeProps(right, ['x','y']);
      renderer.gradient = canvasContext.createLinearGradient( lx, ly, rx, ry );

      for (var i = 0, ni = stops.length, di = null; i < ni; i++) {
        di = stops[i];
        renderer.gradient.addColorStop(di.offset, di.color);
      }

    }

    return shp.flagReset();

  }

};

export default linearGradient;
