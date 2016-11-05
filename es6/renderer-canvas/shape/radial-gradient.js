/* jshint esnext: true */

import shapeRendering   from '../../renderer-lib/renderer-bridge';

var {anyPropChanged, updateShape, getShapeProps, getShapeRenderer} = shapeRendering;

var radialGradient = function(shp, canvasContext) {

  updateShape(shp);

  var renderer = getShapeRenderer(shp);

  if (!renderer.gradient || anyPropChanged(shp, ['center','focal','radius','stops'])) {
    var {center, focal, radius, stops} = getShapeProps(shp, ['center','focal','radius','stops']);
    renderer.gradient = canvasContext.createRadialGradient(
      center.x, center.y, 0, focal.x,  focal.y, radius
    );

    for (var i = 0; i < stops.length; i++) {
      var stop = stops[i];
      renderer.gradient.addColorStop(stop.offset, stop.color);
    }

  }

  return shp.flagReset();

};

export default radialGradient;
