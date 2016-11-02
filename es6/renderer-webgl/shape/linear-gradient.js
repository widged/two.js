/* jshint esnext: true */

import base from './base';
import shapeRendering   from '../../shape-rendering';

var {isCanvas} = base;
var {getShapeProps, getShapeRenderer, updateShape, anyPropChanged} = shapeRendering;


var linearGradient = {

  render: function(ctx, elem) {

    if (!isCanvas(ctx)) { return; }

    var shp = this;

    updateShape(shp);

    var renderer = getShapeRenderer(shp);

    if (!renderer.gradient  || anyPropChanged(shp, ['endPoints','stops']) ) {

      var {left, right, stops} = getShapeProps(shp, ['left','right','stops']);
      var {x: lx,y: ly} = getShapeProps(left, ['x','y']);
      var {x: rx,y: ry} = getShapeProps(right, ['x','y']);
      renderer.gradient = ctx.createLinearGradient( lx, ly, rx, ry );

      for (var i = 0, ni = stops.length, di = null; i < ni, di = stops[i]; i++) {
        renderer.gradient.addColorStop(di.offset, di.color);
      }

    }

    return shp.flagReset();

  }

};

export default linearGradient;

