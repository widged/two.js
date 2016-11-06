/* jshint esnext: true */

import shapeRendering   from '../../renderer/renderer-bridge';

var {anyPropChanged, getShapeProps, getShapeRenderer} = shapeRendering;

var renderRadialGradient = (shp, canvasContext) => {

  var shapeProps = getShapeProps(shp);

  var renderer = getShapeRenderer(shp);

  if (!renderer.gradient || anyPropChanged(shp, ['center','focal','radius','stops'])) {
    var {center, focal, radius, stops} = shapeProps;
    var {x : cx, y : cy} = center || {x: 0, y: 0};
    var {x : fx, y : fy} = focal || {x: 0, y: 0};
    renderer.gradient = canvasContext.createRadialGradient( cx, cy, 0, fx,  fy, radius );

    for (var i = 0, ni = stops.length; i < ni; i++) {
      var {offset, color} = getShapeProps(stops[i], ['offset','color']);
      renderer.gradient.addColorStop(offset, color);
    }

  }

  return shp.flagReset();

};

export default renderRadialGradient;
