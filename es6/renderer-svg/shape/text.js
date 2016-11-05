/* jshint esnext: true */

import svgFN    from './fn-svg';
import shapeRendering from '../../renderer-lib/renderer-bridge';

var {createElement, setAttributes, getClip} = svgFN;
var {anyPropChanged, getShapeProps, getShapeRenderer} = shapeRendering;

const ALIGNMENTS = {
  left: 'start',
  center: 'middle',
  right: 'end'
};

var text = function(shp, domElement) {

  var attrs = {};

  var {matrix} = getShapeProps(shp, ['matrix']);
  if (matrix.manual || anyPropChanged(shp, ['matrix'])) {
    attrs.transform = 'matrix(' + matrix.toString() + ')';
  }


  if(anyPropChanged(shp, ['family','size','leading','alignment','baseline','style','weight','decoration'])) {

    var { family,  size,  leading,  alignment,  baseline,  style,  weight,  decoration} = getShapeProps(shp,
        ['family','size','leading','alignment','baseline','style','weight','decoration']);
    attrs['font-family'] = family;
    attrs['font-size']   = size;
    attrs['line-height'] = leading;
    attrs['text-anchor'] = ALIGNMENTS[alignment] || alignment;
    attrs['alignment-baseline'] = attrs['dominant-baseline'] = baseline;
    attrs['font-style']  = style;
    attrs['font-weight'] = weight;
    attrs['text-decoration'] = decoration;
  }

  if(anyPropChanged(shp, ['fill','stroke','linewidth','opacity','visibility'])) {
    var { fill,  stroke,  linewidth,  opacity,  visible} = getShapeProps(shp,
        ['fill','stroke','linewidth','opacity','visible']);

    attrs.fill = fill && fill.id ? 'url(#' + fill.id + ')' : fill;
    attrs.stroke = stroke && stroke.id ? 'url(#' + stroke.id + ')' : stroke;
    attrs['stroke-width'] = linewidth;
    attrs.opacity     = opacity;
    attrs.visibility =  visible ? 'visible' : 'hidden';
  }

  var renderer = getShapeRenderer(shp);

  if (!renderer.elem) {
    attrs.id = shp.id;
    renderer.elem = createElement('text', attrs);
    domElement.defs.appendChild(renderer.elem);
  } else {
    setAttributes(renderer.elem, attrs);
  }

  if (anyPropChanged(shp, ['clip'])) {
    var clipElem = getClip(shp);

    var { clip } = getShapeProps(shp, ['clip']);

    if (clip) {
      renderer.elem.removeAttribute('id');
      clipElem.setAttribute('id', shp.id);
      clipElem.appendChild(renderer.elem);
    } else {
      clipElem.removeAttribute('id');
      renderer.elem.setAttribute('id', shp.id);
      getShapeRenderer(shp.parent).elem.appendChild(renderer.elem); // TODO: should be insertBefore
    }
    getShapeRenderer(shp.parent).elem.appendChild(renderer.elem); // TODO: should be insertBefore

  }
  if (anyPropChanged(shp, ['value'])) {
    var { value } = getShapeProps(shp, ['value']);
    renderer.elem.textContent = value;
  }

  return shp.flagReset();

};



export default text;
