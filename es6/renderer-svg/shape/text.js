/* jshint esnext: true */

import base from './base';

const ALIGNMENTS = {
  left: 'start',
  center: 'middle',
  right: 'end'
};

var text = function(domElement) {

  this._update();

  var changed = {};

  var flagMatrix = this._matrix.manual || this._flagMatrix;

  if (flagMatrix) {
    changed.transform = 'matrix(' + this._matrix.toString() + ')';
  }

  if (this._flagFamily) {
    changed['font-family'] = this._family;
  }
  if (this._flagSize) {
    changed['font-size'] = this._size;
  }
  if (this._flagLeading) {
    changed['line-height'] = this._leading;
  }
  if (this._flagAlignment) {
    changed['text-anchor'] = ALIGNMENTS[this._alignment] || this._alignment;
  }
  if (this._flagBaseline) {
    changed['alignment-baseline'] = changed['dominant-baseline'] = this._baseline;
  }
  if (this._flagStyle) {
    changed['font-style'] = this._style;
  }
  if (this._flagWeight) {
    changed['font-weight'] = this._weight;
  }
  if (this._flagDecoration) {
    changed['text-decoration'] = this._decoration;
  }

  if (this._flagFill) {
    changed.fill = this._fill && this._fill.id
      ? 'url(#' + this._fill.id + ')' : this._fill;
  }
  if (this._flagStroke) {
    changed.stroke = this._stroke && this._stroke.id
      ? 'url(#' + this._stroke.id + ')' : this._stroke;
  }
  if (this._flagLinewidth) {
    changed['stroke-width'] = this._linewidth;
  }
  if (this._flagOpacity) {
    changed.opacity = this._opacity;
  }
  if (this._flagVisible) {
    changed.visibility = this._visible ? 'visible' : 'hidden';
  }

  if (!this._renderer.elem) {

    changed.id = this.id;

    this._renderer.elem = base.createElement('text', changed);
    domElement.defs.appendChild(this._renderer.elem);

  } else {

    base.setAttributes(this._renderer.elem, changed);

  }

  if (this._flagClip) {

    var clip = base.getClip(this);
    var elem = this._renderer.elem;

    if (this._clip) {
      elem.removeAttribute('id');
      clip.setAttribute('id', this.id);
      clip.appendChild(elem);
    } else {
      clip.removeAttribute('id');
      elem.setAttribute('id', this.id);
      this.parent._renderer.elem.appendChild(elem); // TODO: should be insertBefore
    }

  }

  if (this._flagValue) {
    this._renderer.elem.textContent = this._value;
  }

  return this.flagReset();

};



export default text;
