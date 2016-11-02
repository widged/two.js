/* jshint esnext: true */

import base from './base';
import shapeRendering   from '../../shape-rendering';


var {isCanvas} = base;
var {getShapeProps, getShapeRenderer, updateShape, anyPropChanged} = shapeRendering;


var radialGradient = {

  render: function(ctx) {

    if (!isCanvas(ctx)) { return; }

    var shp = this;

    updateShape(shp);

    var renderer = getShapeRenderer(shp);

    if (!renderer.gradient  || anyPropChanged(shp, ['center','focal','radius','stops']) ) {

      var {center, focal, radius, stops} = getShapeProps(shp, ['center','focal','radius','stops']);
      var {x: cx,y: cy} = getShapeProps(center, ['x','y']);
      var {x: fx,y: fy} = getShapeProps(focal, ['x','y']);
      renderer.gradient = ctx.createRadialGradient( cx, cy, 0, fx, fy, radius );

      for (var i = 0, ni = stops.length, di = null; i < ni, di = stops[i]; i++) {
        renderer.gradient.addColorStop(di.offset, di.color);
      }

    }

    return shp.flagReset();

  }

};

export default radialGradient;
