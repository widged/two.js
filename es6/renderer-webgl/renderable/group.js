/* jshint esnext: true */

import Matrix   from '../../lib/struct-matrix/Matrix';
import FloatArray   from '../../lib/struct-float-array/FloatArray';
import rendererBridge   from '../../renderer/renderer-bridge';
import rendererFN from './fn-renderer';
import glFN       from './fn-gl';
import base from './base';

var {renderShape} = base;
var {Multiply: multiplyMatrix} = Matrix;
var {recomputeMatrixAndScaleIfNecessary} = rendererFN;
var {getShapeProps, getShapeRenderer, anyPropChanged, raiseFlags} = rendererBridge;
var {MaskMode, remove} = glFN;

var renderGroup = (shp, gl, program) => {

  var shapeProps = getShapeProps(shp);

  var renderer   = recomputeMatrixAndScaleIfNecessary(shp);
  var {parent}   = shapeProps;
  var parentRenderer = getShapeRenderer(shp.parent);

  var { mask, opacity } = shapeProps;
  var {  substractions } = shp.getState();
  if(anyPropChanged(shp.parent, ['opacity'])) { raiseFlags(shp, ['opacity']);}
  renderer.opacity = opacity * (parentRenderer ? parentRenderer.opacity : 1);

  var maskMode = (mask) ? MaskMode(gl, () => { renderShape(mask, gl, program, shp); }) : undefined;

  if(maskMode) { maskMode.on(); }

  // :NOTE: substractions array is reset on flag.reset()
  rendererFN.removeNodes(substractions, gl);

  var {childrenColl} = shapeProps;
  // `shp.children` is a collection, not a proper array
  childrenColl.items.forEach((child) => {
    renderShape(child, gl, program);
  });

  if(maskMode) { maskMode.off(); }

  return shp.flagReset();

};

export default renderGroup;
