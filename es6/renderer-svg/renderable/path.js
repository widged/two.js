/* jshint esnext: true */

import base from './base';
import svgFN    from './fn-svg';
import anchorFN from '../../lib/struct-anchor/anchor-fn';
import rendererBridge   from '../../renderer/renderer-bridge';

const {renderShape} = base;
const {createElement, setAttributes, getClip} = svgFN;
const {toString} = anchorFN;
const {getShapeProps, getShapeMatrix, getShapeRenderer, anyPropChanged} = rendererBridge;

const renderPath = (shp, domElement) => {

  var shapeProps = getShapeProps(shp);

  // Shortcut for hidden objects.
  // Doesn't reset the flags, so changes are stored and
  // applied once the object is visible again
  var {opacity} = shapeProps;
  if (opacity === 0 && !anyPropChanged(shp, ['opacity'])) {
    return shp;
  }

  // Collect any attribute that needs to be attrs here
  var attrs = {};

  var matrix = getShapeMatrix(shp);
  if (matrix.manual || anyPropChanged(shp, ['matrix'])) {
    attrs.transform = 'matrix(' + matrix.toString() + ')';
  }

  if(anyPropChanged(shp, ['anchors'])) {
    var {anchorColl, closed} = shapeProps;
    var anchors = anchorColl.items;
    attrs.d = toString(anchors, closed);
  }

  if(anyPropChanged(shp, ['fill','stroke','linewidth','visibility'])) {
    var { fill,  stroke,  linewidth,  visible} = shapeProps;

    if (fill && getShapeRenderer(fill)) { renderShape(fill, domElement); }
    attrs.fill = fill && fill.id ? 'url(#' + fill.id + ')' : fill;

    if (stroke && getShapeRenderer(stroke)) { renderShape(stroke, domElement); }
    attrs.stroke = stroke && stroke.id ? 'url(#' + stroke.id + ')' : stroke;
    attrs['stroke-width']   = linewidth;
    attrs['stroke-opacity'] = opacity;
    attrs['fill-opacity']   = opacity;
    attrs.visibility =  visible ? 'visible' : 'hidden';
  }

  if(anyPropChanged(shp, ['cap','join','miter'])) {
    var { cap,  join,  miter} = shapeProps;
    attrs['stroke-linecap'] = cap;
    attrs['stroke-linejoin'] = join;
    attrs['stroke-miterlimit'] = miter;
  }

  var renderer = getShapeRenderer(shp);
  // If there is no attached DOM element yet,
  // create it with all necessary attributes.
  if (!renderer.elem) {
    attrs.id = shp.id;
    renderer.elem = createElement('path', attrs);
    domElement.appendChild(renderer.elem);
  // Otherwise apply all pending attributes
  } else {
    setAttributes(renderer.elem, attrs);
  }

  if (anyPropChanged(shp, ['clip'])) {
    var clipElem = getClip(shp);

    var { clip } = shapeProps;

    if (clip) {
      renderer.elem.removeAttribute('id');
      clipElem.setAttribute('id', shp.id);
      clipElem.appendChild(renderer.elem);
    } else {
      clipElem.removeAttribute('id');
      renderer.elem.setAttribute('id', shp.id);
      getShapeRenderer(shp.parent).elem.appendChild(renderer.elem); // TODO: should be insertBefore
    }

  }

  /**
   * Commented two-way functionality of clips / masks with groups and
   * polygons. Uncomment when that bug is fixed:
   * https://code.google.com/p/chromium/issues/detail?id=370951
   */

  // if (anyPropChanged(shp, ['mask'])) {
  //  var { mask } = shapeProps;
  //   if (mask) {
  //     elem.setAttribute('clip-path', 'url(#' + mask.id + ')');
  //   } else {
  //     elem.removeAttribute('clip-path');
  //   }
  // }

  return shp.flagReset();

};


export default renderPath;
