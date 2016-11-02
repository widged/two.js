/* jshint esnext: true */

import is  from '../../util/is';
import shapeRendering   from '../../shape-rendering';
import boundingFN from './fn-bounding';
import rendererFN from './fn-renderer';
import anchorFN   from './fn-anchors';
import base from './base';

var {isNumber, isString} = is;
var {getShapeProps, getShapeRenderer, updateShape, anyPropChanged} = shapeRendering;
var {updatePathAnchors} = anchorFN;
var {getPathBoundingClientRect} = boundingFN;
var {hasGradientChanged, renderPath} = rendererFN;
var {canvas, ctx, renderShape, isHidden} = base;

var path = {

  updateCanvas: function(shp) {

    var renderer = getShapeRenderer(shp);

    // styles
    var { vertices,  stroke,  linewidth,  fill,  opacity,  cap,  join,  miter,  closed} = getShapeProps( shp,
        ["vertices","stroke","linewidth","fill","opacity","cap","join","miter","closed"]
    );
    opacity = renderer.opacity || opacity;
    linewidth = linewidth * renderer.scale;

    canvas.width  = Math.max(Math.ceil(renderer.rect.width  * renderer.scale), 1);
    canvas.height = Math.max(Math.ceil(renderer.rect.height * renderer.scale), 1);

    var centroid = renderer.rect.centroid;
    var cx = centroid.x;
    var cy = centroid.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (fill) {
      if (isString(fill)) {
        ctx.fillStyle = fill;
      } else {
        renderShape(fill, ctx, shp);
        ctx.fillStyle = getShapeRenderer(fill).gradient;
      }
    }
    if (stroke) {
      if (isString(stroke)) {
        ctx.strokeStyle = stroke;
      } else {
        renderShape(stroke, ctx, shp);
        ctx.strokeStyle = getShapeRenderer(stroke).gradient;
      }
    }
    if (linewidth) { ctx.lineWidth  = linewidth; }
    if (miter)     { ctx.miterLimit = miter;     }
    if (join)      { ctx.lineJoin   = join;      }
    if (cap)       { ctx.lineCap    = cap;       }
    if (isNumber(opacity)) { ctx.globalAlpha = opacity; }

    ctx.save();
    ctx.scale(renderer.scale, renderer.scale);
    ctx.translate(cx, cy);

    ctx.beginPath();
    updatePathAnchors(vertices);
    if (closed) { ctx.closePath(); }

    if (!isHidden.test(fill)) ctx.fill();
    if (!isHidden.test(stroke)) ctx.stroke();

    ctx.restore();
  },


  render: function(gl, program, forcedParent) {

    var shp = this;

    // <<< code that varies between text and path
    var getBoundingClientRect = (shp) => {
      var { vertices,  linewidth} = getShapeProps( shp, ["vertices","linewidth"] );
      return getPathBoundingClientRect(vertices, linewidth);
    };

    var assertShapeChange = (shp) => {
      return hasGradientChanged(shp) || anyPropChanged(shp.parent, ['cap','join','miter']);
    };
    // >>>

    var rendered = renderPath(gl, program, shp, assertShapeChange, getBoundingClientRect);
    if(rendered) { shp.flagReset(); }
    return shp;

  }

};

export default path;
