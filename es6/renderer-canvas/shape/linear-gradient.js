/* jshint esnext: true */

import shapeRendering   from '../../renderer-bridge';

var {anyPropChanged, updateShape, getShapeProps, getShapeRenderer} = shapeRendering;

var linearGradient = function(shp, ctx) {


  var renderer = getShapeRenderer(shp);

  if (!renderer.gradient || anyPropChanged(shp, ['stops', 'endPoints'])) {
    var { stops, left, right } = getShapeProps(shp, ['stops','left','right']);

    renderer.gradient = ctx.createLinearGradient(
      left.x, left.y, right.x, right.y
    );

    for (var i = 0; i < stops.length; i++) {
      var stop = stops[i];
      renderer.gradient.addColorStop(stop.offset, stop.color);
    }
  }

  return shp.flagReset();

};


export default linearGradient;
