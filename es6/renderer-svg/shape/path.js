/* jshint esnext: true */

import base from './base';

var {renderShape} = base;

var path = function(domElement) {

  this._update();

  // Shortcut for hidden objects.
  // Doesn't reset the flags, so changes are stored and
  // applied once the object is visible again
  if (this._opacity === 0 && !this._flagOpacity) {
    return this;
  }

  // Collect any attribute that needs to be changed here
  var changed = {};

  var flagMatrix = this._matrix.manual || this._flagMatrix;

  if (flagMatrix) {
    changed.transform = 'matrix(' + this._matrix.toString() + ')';
  }

  if (this._flagVertices) {
    var vertices = base.toString(this._vertices, this._closed);
    changed.d = vertices;
  }

  if (this._flagFill) {
    if (this._fill && this._fill._renderer) {
      renderShape(this._fill, domElement);
    }
    changed.fill = this._fill && this._fill.id
      ? 'url(#' + this._fill.id + ')' : this._fill;
  }

  if (this._flagStroke) {
    if (this._stroke && this._stroke._renderer) {
      renderShape(this._stroke, domElement);
    }
    changed.stroke = this._stroke && this._stroke.id
      ? 'url(#' + this._stroke.id + ')' : this._stroke;
  }

  if (this._flagLinewidth) {
    changed['stroke-width'] = this._linewidth;
  }

  if (this._flagOpacity) {
    changed['stroke-opacity'] = this._opacity;
    changed['fill-opacity'] = this._opacity;
  }

  if (this._flagVisible) {
    changed.visibility = this._visible ? 'visible' : 'hidden';
  }

  if (this._flagCap) {
    changed['stroke-linecap'] = this._cap;
  }

  if (this._flagJoin) {
    changed['stroke-linejoin'] = this._join;
  }

  if (this._flagMiter) {
    changed['stroke-miterlimit'] = this._miter;
  }

  // If there is no attached DOM element yet,
  // create it with all necessary attributes.
  if (!this._renderer.elem) {

    changed.id = this.id;
    this._renderer.elem = base.createElement('path', changed);
    domElement.appendChild(this._renderer.elem);

  // Otherwise apply all pending attributes
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

  /**
   * Commented two-way functionality of clips / masks with groups and
   * polygons. Uncomment when this bug is fixed:
   * https://code.google.com/p/chromium/issues/detail?id=370951
   */

  // if (this._flagMask) {
  //   if (this._mask) {
  //     elem.setAttribute('clip-path', 'url(#' + this._mask.id + ')');
  //   } else {
  //     elem.removeAttribute('clip-path');
  //   }
  // }

  return this.flagReset();

};


export default path;
