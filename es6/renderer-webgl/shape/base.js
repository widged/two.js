/* jshint esnext: true */

import _  from '../../util/common';
import Cache   from '../../util/Cache';
import Matrix   from '../../struct/Matrix';
import Array2   from '../../struct/Array';
import Commands from '../../constant/CommandTypes';


var FN = {};

// ------------------------------------
//  Interface
// ------------------------------------

var shapeCache = new Cache((key) => { return require('./' + key).default; });

FN.renderShape = (elm, ctx, condi, clip) => {
  shapeCache.get(elm.rendererType).render.call(elm, ctx, condi, clip);
};

FN.updateCanvas = (elm, webgl) => {
  shapeCache.get(elm.rendererType).updateCanvas.call(webgl, elm);
};

FN.Commands = Commands;


// ------------------------------------
//  Utilities available to all shapes
// ------------------------------------

FN.isHidden = /(none|transparent)/i;

FN.canvas = (document ? document.createElement('canvas') : { getContext: (v) =>  { return v; } });

FN.matrix = new Matrix();

FN.ctx = FN.canvas.getContext('2d');

FN.transformation = new Array2(9);

FN.uv = new Array2([
  0, 0,
  1, 0,
  0, 1,
  0, 1,
  1, 0,
  1, 1
]);


export default FN;
