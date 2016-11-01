/* jshint esnext: true */

import is  from '../../util/is';
import base from './base';
import Matrix   from '../../struct/Matrix';
import Array2   from '../../struct/Array';
import LinearGradient   from '../../shape/gradient/LinearGradient';
import RadialGradient   from '../../shape/gradient/RadialGradient';

var {isString, isNumber} = is;

const ALIGNMENTS = {
  left: 'start',
  middle: 'center',
  right: 'end'
};

var multiplyMatrix = Matrix.Multiply;

var {transformation, renderShape, isHidden, ctx, updateBuffer, updateTexture, getTriangles, drawTextureAndRect} = base;

var getBoundingClientRect = function(elem, rect, lineWidth, stroke) {

  ctx.font = [elem._style, elem._weight, elem._size + 'px/' +
    elem._leading + 'px', elem._family].join(' ');

  ctx.textAlign = 'center';
  ctx.textBaseline = elem._baseline;

  // TODO: Estimate this better
  var width = ctx.measureText(elem._value).width;
  var height = Math.max(elem._size || elem._leading);

  if (lineWidth && !isHidden.test(stroke)) {
    // width += this._linewidth; // TODO: Not sure if the `measure` calcs this.
    height += lineWidth;
  }

  var w = width / 2;
  var h = height / 2;

  switch (ALIGNMENTS[elem._alignment] || elem._alignment) {

    case ALIGNMENTS.left:
      rect.left = 0;
      rect.right = width;
      break;
    case ALIGNMENTS.right:
      rect.left = - width;
      rect.right = 0;
      break;
    default:
      rect.left = - w;
      rect.right = w;
  }

  // TODO: Gradients aren't inherited...
  switch (elem._baseline) {
    case 'bottom':
      rect.top = - height;
      rect.bottom = 0;
      break;
    case 'top':
      rect.top = 0;
      rect.bottom = height;
      break;
    default:
      rect.top = - h;
      rect.bottom = h;
  }

  rect.width = width;
  rect.height = height;

  if (!rect.centroid) {
    rect.centroid = {};
  }

  // TODO:
  rect.centroid.x = w;
  rect.centroid.y = h;

};

var text = {

  updateCanvas: function(elem) {

    var canvas = this.canvas;
    var ctx = this.ctx;

    // Styles
    var scale = elem._renderer.scale;
    var stroke = elem._stroke;
    var linewidth = elem._linewidth * scale;
    var fill = elem._fill;
    var opacity = elem._renderer.opacity || elem._opacity;

    canvas.width = Math.max(Math.ceil(elem._renderer.rect.width * scale), 1);
    canvas.height = Math.max(Math.ceil(elem._renderer.rect.height * scale), 1);

    var centroid = elem._renderer.rect.centroid;
    var cx = centroid.x;
    var cy = centroid.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = [elem._style, elem._weight, elem._size + 'px/' +
      elem._leading + 'px', elem._family].join(' ');

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Styles
    if (fill) {
      if (isString(fill)) {
        ctx.fillStyle = fill;
      } else {
        renderShape(fill, ctx, elem);
        ctx.fillStyle = fill._renderer.gradient;
      }
    }
    if (stroke) {
      if (isString(stroke)) {
        ctx.strokeStyle = stroke;
      } else {
        renderShape(stroke, ctx, elem);
        ctx.strokeStyle = stroke._renderer.gradient;
      }
    }
    if (linewidth) {
      ctx.lineWidth = linewidth;
    }
    if (isNumber(opacity)) {
      ctx.globalAlpha = opacity;
    }

    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(cx, cy);

    if (!isHidden.test(fill)) ctx.fillText(elem.value, 0, 0);
    if (!isHidden.test(stroke)) ctx.strokeText(elem.value, 0, 0);

    ctx.restore();

  },

  render: function(gl, program, forcedParent) {

    if (!this._visible || !this._opacity) {
      return this;
    }

    // Calculate what changed

    var parent = this.parent;
    var flagParentMatrix = parent._matrix.manual || parent._flag_matrix;
    var flagMatrix = this._matrix.manual || this._flag_matrix;
    var flagTexture = this._flag_vertices || this._flag_fill
      || (this._fill instanceof LinearGradient && (this._fill._flag_spread || this._fill._flag_stops || this._fill._flag_endPoints))
      || (this._fill instanceof RadialGradient && (this._fill._flag_spread || this._fill._flag_stops || this._fill._flag_radius || this._fill._flag_center || this._fill._flag_focal))
      || (this._stroke instanceof LinearGradient && (this._stroke._flag_spread || this._stroke._flag_stops || this._stroke._flag_endPoints))
      || (this._stroke instanceof RadialGradient && (this._stroke._flag_spread || this._stroke._flag_stops || this._stroke._flag_radius || this._stroke._flag_center || this._stroke._flag_focal))
      || this._flag_stroke || this._flag_linewidth || this._flag_opacity
      || parent._flag_opacity || this._flag_visible || this._flag_scale
      || this._flag_value || this._flag_family || this._flag_size
      || this._flag_leading || this._flag_alignment || this._flag_baseline
      || this._flag_style || this._flag_weight || this._flag_decoration
      || !this._renderer.texture;

    this._update();

    if (flagParentMatrix || flagMatrix) {

      if (!this._renderer.matrix) {
        this._renderer.matrix = new Array2(9);
      }

      // Reduce amount of object / array creation / deletion

      this._matrix.toArray(true, transformation);

      multiplyMatrix(transformation, parent._renderer.matrix, this._renderer.matrix);
      this._renderer.scale = this._scale * parent._renderer.scale;

    }

    if (flagTexture) {

      if (!this._renderer.rect) {
        this._renderer.rect = {};
      }

      if (!this._renderer.triangles) {
        this._renderer.triangles = new Array2(12);
      }

      this._renderer.opacity = this._opacity * parent._renderer.opacity;

      getBoundingClientRect(this, this._renderer.rect, this._linewidth, this._stroke);
      getTriangles(this._renderer.rect, this._renderer.triangles);

      updateBuffer.call(base, gl, this, program);
      updateTexture.call(base, gl, this);

    }

    // if (this._mask) {
    //   webgl[this._mask.rendererType].render.call(mask, gl, program, this);
    // }

    if (this._clip && !forcedParent) {
      return;
    }

    drawTextureAndRect({
      gl: gl,
      coordBind: this._renderer.textureCoordsBuffer,
      coordVertex: program.textureCoords,
      textureBind: this._renderer.texture,
      rectMatrixBuffer: program.matrix,
      rectMatrix: this._renderer.matrix,
      rectBind: this._renderer.buffer,
      rectVertex: program.position
    });

    return this.flagReset();

  }

};

export default text;
