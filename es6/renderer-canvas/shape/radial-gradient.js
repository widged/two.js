/* jshint esnext: true */

import shapeRendering   from '../../renderer-lib/renderer-bridge';

var {anyPropChanged, getShapeProps, getShapeRenderer} = shapeRendering;

var renderRadialGradient = (shp, canvasContext) => {

  var shapeProps = getShapeProps(shp);

  var renderer = getShapeRenderer(shp);

  if (!renderer.gradient || anyPropChanged(shp, ['center','focal','radius','stops'])) {
    var {center, focal, radius, stops} = shapeProps;
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

export default renderRadialGradient;
