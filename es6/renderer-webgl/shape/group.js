/* jshint esnext: true */

import Matrix   from '../../struct/Matrix';
import Array2   from '../../struct/Array';
import shapeRendering   from '../../renderer-lib/renderer-bridge';
import rendererFN from './fn-renderer';
import glFN       from './fn-gl';
import base from './base';

var {renderShape} = base;
var {Multiply: multiplyMatrix} = Matrix;
var {recomputeMatrixAndScaleIfNecessary} = rendererFN;
var {getShapeProps, getShapeRenderer, anyPropChanged, raiseFlags} = shapeRendering;
var {MaskMode, remove} = glFN;

var group = function(shp, gl, program) {

    var renderer       = recomputeMatrixAndScaleIfNecessary(shp);
    var parentRenderer = getShapeRenderer(shp.parent);

    var { mask, opacity, substractions } = getShapeProps( shp, ["mask","opacity","substractions"] );
    if(anyPropChanged(shp.parent, ['opacity'])) { raiseFlags(shp, ['opacity']);}
    renderer.opacity = opacity * (parentRenderer ? parentRenderer.opacity : 1);

    var maskMode = (mask) ? MaskMode(gl, () => { renderShape(mask, gl, program, shp); }) : undefined;

    if(maskMode) { maskMode.on(); }

    // :NOTE: substractions array is reset on flag.reset()
    rendererFN.removeNodes(substractions, gl);

    // shp.children is a collection, not a proper array
    Array.from(shp.children).forEach((child) => {
      renderShape(child, gl, program);
    });

    if(maskMode) { maskMode.off(); }

    return shp.flagReset();

};

export default group;
