/* jshint esnext: true */

/**
 * A list of applicable types of rendering contexts. This is used to standardize
 * the addresses of the various renderers. The types include svg, canvas, and
 * webgl. e.g: Two.Types.svg
 */
export default {
  webgl: 'WebGLRenderer',
  svg: 'SVGRenderer',
  canvas: 'CanvasRenderer'
};
