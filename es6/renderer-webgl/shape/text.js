/* jshint esnext: true */

import is  from '../../util/is';
import shapeRendering   from '../../shape-rendering';
import verticesUpdater from './vertices-updater';
import boundingRect from './bounding-rect';
import rendererUpdater from './renderer-updater';
import base from './base';

var {isNumber, isString} = is;
var {getShapeProps, getShapeRenderer, updateShape, anyPropChanged} = shapeRendering;
var {updatePathVertices} = verticesUpdater;
var {getTextBoundingClientRect} = boundingRect;
var {hasGradientChanged, renderPath} = rendererUpdater;
var {canvas, ctx, renderShape, isHidden} = base;

var text = {

  updateCanvas: function(shp) {

    var base = this;

    var renderer = getShapeRenderer(shp);

    // Styles
    var scale = renderer.scale;
    var stroke = shp._stroke;
    var linewidth = shp._linewidth * scale;
    var fill = shp._fill;
    var opacity = renderer.opacity || shp._opacity;

    canvas.width = Math.max(Math.ceil(renderer.rect.width * scale), 1);
    canvas.height = Math.max(Math.ceil(renderer.rect.height * scale), 1);

    var {x: cx, y: cy} = renderer.rect.centroid;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = [shp._style, shp._weight, shp._size + 'px/' +
      shp._leading + 'px', shp._family].join(' ');

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Styles
    if (fill) {
      if (isString(fill)) {
        ctx.fillStyle = fill;
      } else {
        renderShape(fill, ctx, shp);
        ctx.fillStyle = fill._renderer.gradient;
      }
    }
    if (stroke) {
      if (isString(stroke)) {
        ctx.strokeStyle = stroke;
      } else {
        renderShape(stroke, ctx, shp);
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

    if (!isHidden.test(fill)) ctx.fillText(shp.value, 0, 0);
    if (!isHidden.test(stroke)) ctx.strokeText(shp.value, 0, 0);

    ctx.restore();

  },

  render: function(gl, program, forcedParent) {

    var shp = this;

    // <<< code that varies between text and path
    var getBoundingClientRect = (shp) => {
      var { stroke, linewidth} = getShapeProps( shp, ["stroke","linewidth"] );
      var border = (linewidth && !isHidden.test(stroke)) ? linewidth : 0;
      var props = getShapeProps( shp, ["value","style","weight","size","leading","family","baseline","alignment"] );
      return getTextBoundingClientRect(border, props);
    };

    var assertShapeChange = () => {
      return hasGradientChanged || anyPropChanged(shp, ['value','family','size','leading','alignment','baseline','style','weight','decoration']);
    };

    // >>>

    renderPath(gl, program, shp, assertShapeChange, getBoundingClientRect);
    return shp.flagReset();

  }

};

export default text;
