import Matrix   from '../../struct/Matrix';
import Array2   from '../../struct/Array';

import base from './base';

var {renderShape, transformation} = base;
var {Multiply: multiplyMatrix} = Matrix;

var removeChild = function(child, gl) {
  if (child.children) {
    for (var i = 0; i < child.children.length; i++) {
      removeChild(child.children[i], gl);
    }
    return;
  }
  // Deallocate texture to free up gl memory.
  gl.deleteTexture(child._renderer.texture);
  delete child._renderer.texture;
};

var group = {

    render: function(gl, program) {

      this._update();

      var parent = this.parent;
      var flagParentMatrix = (parent._matrix && parent._matrix.manual) || parent._flagMatrix;
      var flagMatrix = this._matrix.manual || this._flagMatrix;

      if (flagParentMatrix || flagMatrix) {

        if (!this._renderer.matrix) {
          this._renderer.matrix = new Array2(9);
        }

        // Reduce amount of object / array creation / deletion
        this._matrix.toArray(true, transformation);

        multiplyMatrix(transformation, parent._renderer.matrix, this._renderer.matrix);
        this._renderer.scale = this._scale * parent._renderer.scale;

        if (flagParentMatrix) {
          this._flagMatrix = true;
        }

      }

      if (this._mask) {

        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(gl.ALWAYS, 1, 1);

        gl.colorMask(false, false, false, true);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);

        renderShape(this._mask, gl, program, this);

        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.NOTEQUAL, 0, 1);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

      }

      this._flagOpacity = parent._flagOpacity || this._flagOpacity;

      this._renderer.opacity = this._opacity
        * (parent && parent._renderer ? parent._renderer.opacity : 1);

      if (this._flagSubtractions) {
        for (var i = 0; i < this.subtractions.length; i++) {
          removeChild(this.subtractions[i], gl);
        }
      }

      
      Array.from(this.children).forEach((child) => {
        renderShape(child, gl, program);
      })

      if (this._mask) {

        gl.colorMask(false, false, false, false);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);

        renderShape(this._mask, gl, program, this);

        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.NOTEQUAL, 0, 1);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

        gl.disable(gl.STENCIL_TEST);

      }

      return this.flagReset();

    }

  }

export default group;