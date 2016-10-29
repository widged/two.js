import base from './base';

var {isDefaultMatrix, renderShape} = base;

var group = function(ctx) {

  // TODO: Add a check here to only invoke _update if need be.
  this._update();

  var matrix = this._matrix.elements;
  var parent = this.parent;
  this._renderer.opacity = this._opacity * (parent && parent._renderer ? parent._renderer.opacity : 1);

  var defaultMatrix = isDefaultMatrix(matrix);

  var mask = this._mask;
  // var clip = this._clip;

  if (!this._renderer.context) {
    this._renderer.context = {};
  }

  this._renderer.context.ctx = ctx;
  // this._renderer.context.clip = clip;

  if (!defaultMatrix) {
    ctx.save();
    ctx.transform(matrix[0], matrix[3], matrix[1], matrix[4], matrix[2], matrix[5]);
  }

  if (mask) {
    renderShape(mask, ctx, true);
  }

  for (var i = 0; i < this.children.length; i++) {
    var child = this.children[i];
    renderShape(child, ctx);
  }

  if (!defaultMatrix) {
    ctx.restore();
  }

 /**
 * Commented two-way functionality of clips / masks with groups and
 * polygons. Uncomment when this bug is fixed:
 * https://code.google.com/p/chromium/issues/detail?id=370951
 */

  // if (clip) {
  //   ctx.clip();
  // }

  return this.flagReset();

}




  export default group;