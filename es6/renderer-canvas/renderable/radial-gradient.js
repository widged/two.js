/* jshint esnext: true */

import rendererBridge   from '../../renderer/renderer-bridge';

const {anyPropChanged, getShapeProps, getShapeRenderer} = rendererBridge;

const renderRadialGradient = (shp, canvasContext) => {

  const shapeProps = getShapeProps(shp);
  const renderer = getShapeRenderer(shp);

  if (!renderer.gradient || anyPropChanged(shp, ['center','focal','radius','stops'])) {

    const {center, focal, radius, stops} = shapeProps;
    const {x : cx, y : cy} = center || {x: 0, y: 0};
    const {x : fx, y : fy} = focal || {x: 0, y: 0};
    renderer.gradient = canvasContext.createRadialGradient( cx, cy, 0, fx,  fy, radius );

    for (var i = 0, ni = stops.length; i < ni; i++) {
      const {offset, color} = getShapeProps(stops[i], ['offset','color']);
      renderer.gradient.addColorStop(offset, color);
    }

  }

  return shp.flagReset();

};

export default renderRadialGradient;
