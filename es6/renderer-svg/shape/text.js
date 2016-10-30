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

  var flagMatrix = this._matrix.manual || this._flag_matrix;

  if (flagMatrix) {
    changed.transform = 'matrix(' + this._matrix.toString() + ')';
  }

  if (this._flag_family) {
    changed['font-family'] = this._family;
  }
  if (this._flag_size) {
    changed['font-size'] = this._size;
  }
  if (this._flag_leading) {
    changed['line-height'] = this._leading;
  }
  if (this._flag_alignment) {
    changed['text-anchor'] = ALIGNMENTS[this._alignment] || this._alignment;
  }
  if (this._flag_baseline) {
    changed['alignment-baseline'] = changed['dominant-baseline'] = this._baseline;
  }
  if (this._flag_style) {
    changed['font-style'] = this._style;
  }
  if (this._flag_weight) {
    changed['font-weight'] = this._weight;
  }
  if (this._flag_decoration) {
    changed['text-decoration'] = this._decoration;
  }

  if (this._flag_fill) {
    changed.fill = this._fill && this._fill.id
      ? 'url(#' + this._fill.id + ')' : this._fill;
  }
  if (this._flag_stroke) {
    changed.stroke = this._stroke && this._stroke.id
      ? 'url(#' + this._stroke.id + ')' : this._stroke;
  }
  if (this._flag_linewidth) {
    changed['stroke-width'] = this._linewidth;
  }
  if (this._flag_opacity) {
    changed.opacity = this._opacity;
  }
  if (this._flag_visible) {
    changed.visibility = this._visible ? 'visible' : 'hidden';
  }

  if (!this._renderer.elem) {

    changed.id = this.id;

    this._renderer.elem = base.createElement('text', changed);
    domElement.defs.appendChild(this._renderer.elem);

  } else {

    base.setAttributes(this._renderer.elem, changed);

  }

  if (this._flag_clip) {

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

  if (this._flag_value) {
    this._renderer.elem.textContent = this._value;
  }

  return this.flagReset();

};



export default text;
