/* jshint esnext: true */

import base from './base';
import svgFN    from './fn-svg';

var {createElement, setAttributes} = svgFN;
var {renderShape} = base;

var orderChild = function(object) {
  this.elem.appendChild(object._renderer.elem);
};

  // TODO: Can speed up.
  // TODO: How does this effect a f
var appendChild = function(object) {

  var elem = object._renderer.elem;

  if (!elem) {
    return;
  }

  var tag = elem.nodeName;

  if (!tag || /(radial|linear)gradient/i.test(tag) || object._clip) {
    return;
  }

  this.elem.appendChild(elem);

};

var removeChild = function(object) {

  var elem = object._renderer.elem;

  if (!elem || elem.parentNode != this.elem) {
    return;
  }

  var tag = elem.nodeName;

  if (!tag) {
    return;
  }

  // Defer subtractions while clipping.
  if (object._clip) {
    return;
  }

  this.elem.removeChild(elem);

};

var group = function(domElement) {

  this._update();

  // Shortcut for hidden objects.
  // Doesn't reset the flags, so changes are stored and
  // applied once the object is visible again
  if (this._opacity === 0 && !this._flag_opacity) {
    return this;
  }

  if (!this._renderer.elem) {
    this._renderer.elem = createElement('g', {
      id: this.id
    });
    domElement.appendChild(this._renderer.elem);
  }

  // _Update styles for the <g>
  var flagMatrix = this._matrix.manual || this._flag_matrix;
  var context = {
    domElement: domElement,
    elem: this._renderer.elem
  };

  if (flagMatrix) {
    this._renderer.elem.setAttribute('transform', 'matrix(' + this._matrix.toString() + ')');
  }

  for (var i = 0; i < this.children.length; i++) {
    var child = this.children[i];
    renderShape(child, domElement);
  }

  if (this._flag_opacity) {
    this._renderer.elem.setAttribute('opacity', this._opacity);
  }

  if (this._flag_additions) {
    this.additions.forEach(appendChild, context);
  }

  if (this._flag_subtractions) {
    this.subtractions.forEach(removeChild, context);
  }

  if (this._flag_order) {
    this.children.forEach(orderChild, context);
  }

  /**
   * Commented two-way functionality of clips / masks with groups and
   * polygons. Uncomment when this bug is fixed:
   * https://code.google.com/p/chromium/issues/detail?id=370951
   */

  // if (this._flag_clip) {

  //   clip = svg.getClip(this);
  //   elem = this._renderer.elem;

  //   if (this._clip) {
  //     elem.removeAttribute('id');
  //     clip.setAttribute('id', this.id);
  //     clip.appendChild(elem);
  //   } else {
  //     clip.removeAttribute('id');
  //     elem.setAttribute('id', this.id);
  //     this.parent._renderer.elem.appendChild(elem); // TODO: should be insertBefore
  //   }

  // }

  if (this._flag_mask) {
    if (this._mask) {
      this._renderer.elem.setAttribute('clip-path', 'url(#' + this._mask.id + ')');
    } else {
      this._renderer.elem.removeAttribute('clip-path');
    }
  }

  return this.flagReset();

};


export default group;
