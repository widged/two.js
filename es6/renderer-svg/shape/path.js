/* jshint esnext: true */

import base from './base';

var {renderShape} = base;

var path = function(domElement) {

  this._update();

  // Shortcut for hidden objects.
  // Doesn't reset the flags, so changes are stored and
  // applied once the object is visible again
  if (this._opacity === 0 && !this._flag_opacity) {
    return this;
  }

  // Collect any attribute that needs to be changed here
  var changed = {};

  var flagMatrix = this._matrix.manual || this._flag_matrix;

  if (flagMatrix) {
    changed.transform = 'matrix(' + this._matrix.toString() + ')';
  }

  if (this._flag_vertices) {
    var vertices = base.toString(this._vertices, this._closed);
    changed.d = vertices;
  }

  if (this._flag_fill) {
    if (this._fill && this._fill._renderer) {
      renderShape(this._fill, domElement);
    }
    changed.fill = this._fill && this._fill.id
      ? 'url(#' + this._fill.id + ')' : this._fill;
  }

  if (this._flag_stroke) {
    if (this._stroke && this._stroke._renderer) {
      renderShape(this._stroke, domElement);
    }
    changed.stroke = this._stroke && this._stroke.id
      ? 'url(#' + this._stroke.id + ')' : this._stroke;
  }

  if (this._flag_linewidth) {
    changed['stroke-width'] = this._linewidth;
  }

  if (this._flag_opacity) {
    changed['stroke-opacity'] = this._opacity;
    changed['fill-opacity'] = this._opacity;
  }

  if (this._flag_visible) {
    changed.visibility = this._visible ? 'visible' : 'hidden';
  }

  if (this._flag_cap) {
    changed['stroke-linecap'] = this._cap;
  }

  if (this._flag_join) {
    changed['stroke-linejoin'] = this._join;
  }

  if (this._flag_miter) {
    changed['stroke-miterlimit'] = this._miter;
  }

  // If there is no attached DOM element yet,
  // create it with all necessary attributes.
  if (!this._renderer.elem) {

    changed.id = this.id;
    this._renderer.elem = base.createSvgElement('path', changed);
    domElement.appendChild(this._renderer.elem);

  // Otherwise apply all pending attributes
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

  /**
   * Commented two-way functionality of clips / masks with groups and
   * polygons. Uncomment when this bug is fixed:
   * https://code.google.com/p/chromium/issues/detail?id=370951
   */

  // if (this._flag_mask) {
  //   if (this._mask) {
  //     elem.setAttribute('clip-path', 'url(#' + this._mask.id + ')');
  //   } else {
  //     elem.removeAttribute('clip-path');
  //   }
  // }

  return this.flagReset();

};


export default path;
