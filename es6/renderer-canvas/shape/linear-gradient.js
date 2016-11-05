/* jshint esnext: true */

import shapeRendering   from '../../renderer-lib/renderer-bridge';

var {anyPropChanged, getShapeProps, getShapeRenderer} = shapeRendering;

var renderLinearGradient = (shp, ctx) => {

  var shapeProps = getShapeProps(shp);
  var renderer   = getShapeRenderer(shp);

  if (!renderer.gradient || anyPropChanged(shp, ['stops', 'endPoints'])) {
    var { stops, left, right } = shapeProps;

    renderer.gradient = ctx.createLinearGradient(
      left.x, left.y, right.x, right.y
    );

    for (var i = 0, ni = stops.length, stop = null; i < ni; i++) {
      stop = stops[i];
      var {offset, color, opacity} = getShapeProps(stop);
      renderer.gradient.addColorStop(offset, color);
    }
  }

  return shp.flagReset();

};


export default renderLinearGradient;
