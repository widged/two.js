/* jshint esnext: true */

import is  from '../../util/is';
import Matrix   from '../../struct/Matrix';
import base from './base';
import Array2   from '../../struct/Array';
import _ from '../../util/common';
import shapeRendering   from '../../shape-rendering';
import LinearGradient from '../../shape/gradient/LinearGradient';
import RadialGradient from '../../shape/gradient/RadialGradient';

var {renderShape, transformation, Commands, canvas, ctx, drawTextureAndRect} = base;
var {Multiply: multiplyMatrix} = Matrix;
var {isNumber, isString} = is;
var {mod, toFixed} = _;
var {getShapeProps, getRendererProps} = shapeRendering;

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


    // styles
    var { vertices,  stroke,  linewidth,  fill,  opacity,  cap,  join,  miter,  closed} = getShapeProps( elem,
        ["vertices","stroke","linewidth","fill","opacity","cap","join","miter","closed"]
    );

     var {rdr_scale, rdr_opacity, rdr_rect} = getRendererProps( elem,
         [   "scale",   "opacity",   "rect"]
    );
    opacity = rdr_opacity || opacity;
    linewidth = linewidth * rdr_scale;

    var length = vertices.length;
    var last = length - 1;

    canvas.width = Math.max(Math.ceil(rdr_rect.width * rdr_scale), 1);
    canvas.height = Math.max(Math.ceil(rdr_rect.height * rdr_scale), 1);

    var centroid = rdr_rect.centroid;
    var cx = centroid.x;
    var cy = centroid.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (fill) {
      if (isString(fill)) {
        ctx.fillStyle = fill;
      } else {
        renderShape(fill, ctx, elem);
        var fillP = getRendererProps( fill, ["gradient"] );
        ctx.fillStyle = fillP.rdr_gradient;
      }
    }
    if (stroke) {
      if (isString(stroke)) {
        ctx.strokeStyle = stroke;
      } else {
        renderShape(stroke, ctx, elem);
        var strokeP = getRendererProps( stroke, ["gradient"] );
        ctx.strokeStyle = strokeP.rdr_gradient;
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
    ctx.scale(rdr_scale, rdr_scale);
    ctx.translate(cx, cy);

    ctx.beginPath();
    for (var i = 0, ni = vertices.length; i < ni; i++) {

      var b = vertices[i];

      x = toFixed(b._x);
      y = toFixed(b._y);

      switch (b._command) {

        case Commands.close:
          ctx.closePath();
          break;

        case Commands.curve:

          prev = closed ? mod(i - 1, length) : Math.max(i - 1, 0);
          next = closed ? mod(i + 1, length) : Math.min(i + 1, last);

          a = vertices[prev];
          c = vertices[next];
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

    var anyFlagRaised = (node, keys) => {
        return keys.filter((k) => {
          return node['_flag_'+k] ? true : false;
        }).length ? true : false;
    };

    var {fill, stroke} = getShapeProps(
     this, ["fill","stroke"]
   );

    var {rdr_texture} = getRendererProps(
     this, ["texture"]
   );

    var parent = this.parent;
    var flagParentMatrix = parent._matrix.manual || anyFlagRaised(parent, ['matrix']);
    var flagMatrix = this._matrix.manual || anyFlagRaised(this, ['matrix']);
    var flagTexture =
        anyFlagRaised(this, ['vertices','fill','stroke','linewidth','opacity','visible','cap','join','miter','scale'])
        || anyFlagRaised(parent, ['opacity'])
        || !this.rdr_texture
        || (fill   instanceof LinearGradient && anyFlagRaised(fill, ['spread','stops','endPoints']))
        || (stroke instanceof LinearGradient && anyFlagRaised(stroke, ['spread','stops','endPoints']))
        || (fill   instanceof RadialGradient && anyFlagRaised(fill, ['spread','stops','radius','center','focal']));

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

export default path;
