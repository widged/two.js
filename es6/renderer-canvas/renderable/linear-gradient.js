/* jshint esnext: true */

import rendererBridge   from '../../renderer/renderer-bridge';

var {anyPropChanged, getShapeProps, getShapeRenderer} = rendererBridge;

var renderLinearGradient = (shp, ctx) => {

  var shapeProps = getShapeProps(shp);
  var renderer   = getShapeRenderer(shp);

  if (!renderer.gradient || anyPropChanged(shp, ['stops', 'endPoints'])) {

    var { stops, left, right } = shapeProps;
    // console.log(JSON.stringify(stops))
    var {x: x1, y: y1} = left  || {x: 0, y: 0};
    var {x: x2, y: y2} = right || {x: 0, y: 0};
    renderer.gradient = ctx.createLinearGradient( x1, y1, x2, y2 );

    for (var i = 0, ni = (stops || []).length; i < ni; i++) {
      var {offset, color} = getShapeProps(stops[i], ['offset','color']);
      renderer.gradient.addColorStop(offset, color);
    }

  }

  return shp.flagReset();

};


export default renderLinearGradient;
