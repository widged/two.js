/* jshint esnext: true */

import rendererBridge   from '../../renderer/renderer-bridge';
import svgFN    from './fn-svg';

const {getShapeProps, getShapeRenderer, anyPropChanged} = rendererBridge;
const {renderNode, createGradientStop} = svgFN;

var renderRadialGradient = (shp, domElement) => {

  var shapeProps = getShapeProps(shp);

  var changed = {};
  var renderer = getShapeRenderer(shp);


  if ( anyPropChanged(shp, ['center','focal','radius','stops']) ) {
    var {center, focal, radius, stops} = shapeProps;
    var {x : cx, y : cy} = center || {x: 0, y: 0};
    var {x : fx, y : fy} = focal  || {x: 0, y: 0};

    renderer.elem = renderNode(
      renderer.elem, 'radialGradient',
      {id: shp.id, gradientUnits: 'userSpaceOnUse', cx, cy, fx, fy, r:radius},
      domElement.defs
    );

    if (true || anyPropChanged(shp, ['stops'] ) ) {

      svgFN.clear(renderer.elem);

      for (var i = 0, ni = stops.length, stop, stopRenderer, stopNode; i < ni; i++) {
        stop = stops[i];
        var {offset, color, opacity} = getShapeProps(stop, ['offset','color','opacity']);
        stopNode = createGradientStop(offset, color, opacity);
        renderer.elem.appendChild(stopNode);
      }

    }

  }

  return shp.flagReset();

};



export default renderRadialGradient;
