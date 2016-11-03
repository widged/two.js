/* jshint esnext: true */

import svgFN    from './fn-svg';
import shapeRendering from '../../shape-rendering';

var {createElement, setAttributes, getClip} = svgFN;
var {anyPropChanged} = shapeRendering;

const ALIGNMENTS = {
  left: 'start',
  center: 'middle',
  right: 'end'
};

var text = function(domElement) {

  var shp = this;

  this._update();


  var flagMatrix = this._matrix.manual || this._flag_matrix;

  var props = {};

  if (flagMatrix) {
    props.transform = 'matrix(' + this._matrix.toString() + ')';
  }

  if(anyPropChanged(this, ['family','size','leading','alignment','baseline','style','weight','decoration'])) {
    props['font-family'] = this._family;
    props['font-size'] = this._size;
    props['line-height'] = this._leading;
    props['text-anchor'] = ALIGNMENTS[this._alignment] || this._alignment;
    props['alignment-baseline'] = props['dominant-baseline'] = this._baseline;
    props['font-style'] = this._style;
    props['font-weight'] = this._weight;
    props['text-decoration'] = this._decoration;
  }

  if(anyPropChanged(this, ['fill','stroke','linewidth','opacity','visibility'])) {
    props.fill = this._fill && this._fill.id ? 'url(#' + this._fill.id + ')' : this._fill;
    props.stroke = this._stroke && this._stroke.id ? 'url(#' + this._stroke.id + ')' : this._stroke;
    props['stroke-width'] = this._linewidth;
    props.opacity     = this._opacity;
    props.visibility = this._visible ? 'visible' : 'hidden';
  }

  if (!this._renderer.elem) {

    props.id = shp.id;

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
