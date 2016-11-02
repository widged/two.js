/* jshint esnext: true */

import Matrix   from '../../struct/Matrix';
import Array2   from '../../struct/Array';
import shapeRendering   from '../../shape-rendering';
import rendererFN from './fn-renderer';
import glFN       from './fn-gl';
import base from './base';

var {renderShape, transformation} = base;
var {Multiply: multiplyMatrix} = Matrix;
var {recomputeMatrixAndScaleIfNecessary} = rendererFN;
var {getShapeProps, getShapeRenderer, updateShape, anyPropChanged, raiseFlags} = shapeRendering;
var {MaskMode, remove} = glFN;


var removeChild = function(child, gl) {
  if (child.children) {
    for (var i = 0; i < child.children.length; i++) {
      removeChild(child.children[i], gl);
    }
    return;
  }
  glFN.remove(gl, child._renderer.texture);
  delete child._renderer.texture;
};


var group = {

    render: function(gl, program) {

      var shp = this;

      updateShape(shp);

      var renderer       = recomputeMatrixAndScaleIfNecessary(shp);
      var parentRenderer = getShapeRenderer(shp.parent);

      var { mask, opacity, subtractions } = getShapeProps( shp, ["mask","opacity","subtractions"] );
      if(anyPropChanged(shp.parent, ['opacity'])) { raiseFlags(shp, ['opacity']);}
      renderer.opacity = opacity * (parentRenderer ? parentRenderer.opacity : 1);


      var maskMode = (mask) ? MaskMode(gl, () => { renderShape(mask, gl, program, shp); }) : undefined;

      if(maskMode) { maskMode.on(); }

      // :NOTE: subtractions array is reset on flag.reset()
      for (var i = 0; i < subtractions.length; i++) {
        removeChild(subtractions[i], gl);
      }

      // shp.children is a collection, not a proper array
      Array.from(shp.children).forEach((child) => {
        renderShape(child, gl, program);
      });

      if(maskMode) { maskMode.off(); }

      return shp.flagReset();

    }

  };

export default group;
