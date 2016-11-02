/* jshint esnext: true */

import svgFN    from './fn-svg';

var {createElement, setAttributes, getClip} = svgFN;

const ALIGNMENTS = {
  left: 'start',
  center: 'middle',
  right: 'end'
};

var text = function(domElement) {

  this._update();


  var flagMatrix = this._matrix.manual || this._flag_matrix;

  var props = {};

  if (flagMatrix) {
    props.transform = 'matrix(' + this._matrix.toString() + ')';
  }

  if (this._flag_family) {
    props['font-family'] = this._family;
  }
  if (this._flag_size) {
    props['font-size'] = this._size;
  }
  if (this._flag_leading) {
    props['line-height'] = this._leading;
  }
  if (this._flag_alignment) {
    props['text-anchor'] = ALIGNMENTS[this._alignment] || this._alignment;
  }
  if (this._flag_baseline) {
    props['alignment-baseline'] = changed['dominant-baseline'] = this._baseline;
  }
  if (this._flag_style) {
    props['font-style'] = this._style;
  }
  if (this._flag_weight) {
    props['font-weight'] = this._weight;
  }
  if (this._flag_decoration) {
    props['text-decoration'] = this._decoration;
  }

  if (this._flag_fill) {
    props.fill = this._fill && this._fill.id
      ? 'url(#' + this._fill.id + ')' : this._fill;
  }
  if (this._flag_stroke) {
    props.stroke = this._stroke && this._stroke.id
      ? 'url(#' + this._stroke.id + ')' : this._stroke;
  }
  if (this._flag_linewidth) {
    props['stroke-width'] = this._linewidth;
  }
  if (this._flag_opacity) {
    props.opacity = this._opacity;
  }
  if (this._flag_visible) {
    props.visibility = this._visible ? 'visible' : 'hidden';
  }

  if (!this._renderer.elem) {

    props.id = props.id;

    this._renderer.elem = createElement('text', props);
    domElement.defs.appendChild(this._renderer.elem);

  } else {

    setAttributes(this._renderer.elem, props);

  }

  if (this._flag_clip) {

    var clip = getClip(this);
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
