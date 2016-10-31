/* jshint esnext: true */

import is  from '../../util/is';
import Matrix   from '../../struct/Matrix';
import base from './base';
import Array2   from '../../struct/Array';
import _ from '../../util/common';

var {renderShape, transformation, Commands, canvas, ctx, drawTextureAndRect} = base;
var {Multiply: multiplyMatrix} = Matrix;
var {isNumber, isString} = is;
var {mod, toFixed} = _;

/**
 * Returns the rect of a set of verts. Typically takes vertices that are
 * "centered" around 0 and returns them to be anchored upper-left.
 */
var getBoundingClientRect = function(vertices, border, rect) {

  var left = Infinity, right = -Infinity,
      top = Infinity, bottom = -Infinity,
      width, height;

  vertices.forEach(function(v) {

    var x = v.x, y = v.y, controls = v.controls;
    var a, b, c, d, cl, cr;

    top = Math.min(y, top);
    left = Math.min(x, left);
    right = Math.max(x, right);
    bottom = Math.max(y, bottom);

    if (!v.controls) {
      return;
    }

    cl = controls.left;
    cr = controls.right;

    if (!cl || !cr) {
      return;
    }

    a = v._relative ? cl.x + x : cl.x;
    b = v._relative ? cl.y + y : cl.y;
    c = v._relative ? cr.x + x : cr.x;
    d = v._relative ? cr.y + y : cr.y;

    if (!a || !b || !c || !d) {
      return;
    }

    top = Math.min(b, d, top);
    left = Math.min(a, c, left);
    right = Math.max(a, c, right);
    bottom = Math.max(b, d, bottom);

  });

  // Expand borders

  if (isNumber(border)) {
    top -= border;
    left -= border;
    right += border;
    bottom += border;
  }

  width = right - left;
  height = bottom - top;

  rect.top = top;
  rect.left = left;
  rect.right = right;
  rect.bottom = bottom;
  rect.width = width;
  rect.height = height;

  if (!rect.centroid) {
    rect.centroid = {};
  }

  rect.centroid.x = - left;
  rect.centroid.y = - top;

};

var path = {

  updateCanvas: function(elem) {

    var next, prev, a, c, ux, uy, vx, vy, ar, bl, br, cl, x, y;

    var commands = elem._vertices;

    // Styles
    var scale = elem._renderer.scale;
    var stroke = elem._stroke;
    var linewidth = elem._linewidth;
    var fill = elem._fill;
    var opacity = elem._renderer.opacity || elem._opacity;
    var cap = elem._cap;
    var join = elem._join;
    var miter = elem._miter;
    var closed = elem._closed;
    var length = commands.length;
    var last = length - 1;

    canvas.width = Math.max(Math.ceil(elem._renderer.rect.width * scale), 1);
    canvas.height = Math.max(Math.ceil(elem._renderer.rect.height * scale), 1);

    var centroid = elem._renderer.rect.centroid;
    var cx = centroid.x;
    var cy = centroid.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    if (miter) {
      ctx.miterLimit = miter;
    }
    if (join) {
      ctx.lineJoin = join;
    }
    if (cap) {
      ctx.lineCap = cap;
    }
    if (isNumber(opacity)) {
      ctx.globalAlpha = opacity;
    }

    var d;
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(cx, cy);

    ctx.beginPath();
    for (var i = 0; i < commands.length; i++) {

      var b = commands[i];

      x = toFixed(b._x);
      y = toFixed(b._y);

      switch (b._command) {

        case Commands.close:
          ctx.closePath();
          break;

        case Commands.curve:

          prev = closed ? mod(i - 1, length) : Math.max(i - 1, 0);
          next = closed ? mod(i + 1, length) : Math.min(i + 1, last);

          a = commands[prev];
          c = commands[next];
          ar = (a.controls && a.controls.right) || a;
          bl = (b.controls && b.controls.left) || b;

          if (a._relative) {
            vx = toFixed((ar.x + a._x));
            vy = toFixed((ar.y + a._y));
          } else {
            vx = toFixed(ar.x);
            vy = toFixed(ar.y);
          }

          if (b._relative) {
            ux = toFixed((bl.x + b._x));
            uy = toFixed((bl.y + b._y));
          } else {
            ux = toFixed(bl.x);
            uy = toFixed(bl.y);
          }

          ctx.bezierCurveTo(vx, vy, ux, uy, x, y);

          if (i >= last && closed) {

            c = d;

            br = (b.controls && b.controls.right) || b;
            cl = (c.controls && c.controls.left) || c;

            if (b._relative) {
              vx = toFixed((br.x + b._x));
              vy = toFixed((br.y + b._y));
            } else {
              vx = toFixed(br.x);
              vy = toFixed(br.y);
            }

            if (c._relative) {
              ux = toFixed((cl.x + c._x));
              uy = toFixed((cl.y + c._y));
            } else {
              ux = toFixed(cl.x);
              uy = toFixed(cl.y);
            }

            x = toFixed(c._x);
            y = toFixed(c._y);

            ctx.bezierCurveTo(vx, vy, ux, uy, x, y);

          }

          break;

        case Commands.line:
          ctx.lineTo(x, y);
          break;

        case Commands.move:
          d = b;
          ctx.moveTo(x, y);
          break;

      }

    }

    // Loose ends

    if (closed) {
      ctx.closePath();
    }

    if (!base.isHidden.test(fill)) ctx.fill();
    if (!base.isHidden.test(stroke)) ctx.stroke();

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
      || parent._flag_opacity || this._flag_visible || this._flag_cap
      || this._flag_join || this._flag_miter || this._flag_scale
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

      getBoundingClientRect(this._vertices, this._linewidth, this._renderer.rect);
      base.getTriangles(this._renderer.rect, this._renderer.triangles);

      base.updateBuffer.call(base, gl, this, program);
      base.updateTexture.call(base, gl, this);

    }

    // if (this._mask) {
    //   webgl[this._mask._renderer.type].render.call(mask, gl, program, this);
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

export default path;
