import _  from '../util/common';
import is  from '../util/is';
import Commands from '../constant/CommandTypes';
import Types from '../constant/RendererTypes';
import Matrix   from '../struct/Matrix';
import Array2   from '../struct/Array';
import LinearGradient   from '../gradient/LinearGradient';
import RadialGradient   from '../gradient/RadialGradient';
import Group   from '../shape/Group';
import EventsDecorator   from '../util/emitter-decorator';
import TwoError from '../TwoError';
import dom  from '../platform/dom';
import curveFN   from '../util/curve-manipulation';
import MathExtras   from '../util/math-extras';
import Renderer from '../TwoRenderer';
import base from './shape/base';

var {mod, toFixed} = MathExtras;
var {getComputedMatrix} = curveFN;
var {getRatio} = dom;
var {isNumber, isObject, isString, isUndefined} = is;

/**
 * Constants
 */

var identity = [1, 0, 0, 0, 1, 0, 0, 0, 1];


class WebglRenderer extends Renderer {

  constructor(options) {
    super(options);
    var params, gl, vs, fs;
    if(!this.domElement) {this.domElement = document.createElement('canvas'); };


    this._renderer = {
      matrix: new Array2(identity),
      scale: 1,
      opacity: 1
    };
    this._flagMatrix = true;

    // http://games.greggman.com/game/webgl-and-alpha/
    // http://www.khronos.org/registry/webgl/specs/latest/#5.2
    params = _.defaults(options || {}, {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
      stencil: true,
      preserveDrawingBuffer: true,
      overdraw: false
    });

    this.overdraw = params.overdraw;

    gl = this.ctx = this.domElement.getContext('webgl', params) ||
      this.domElement.getContext('experimental-webgl', params);

    if (!this.ctx) {
      throw new TwoError(
        'unable to create a webgl context. Try using another renderer.');
    }

    // Compile Base Shaders to draw in pixel space.
    vs = base.shaders.create(
      gl, base.shaders.vertex, base.shaders.types.vertex);
    fs = base.shaders.create(
      gl, base.shaders.fragment, base.shaders.types.fragment);

    this.program = base.program.create(gl, [vs, fs]);
    gl.useProgram(this.program);

    // Create and bind the drawing buffer

    // look up where the vertex data needs to go.
    this.program.position = gl.getAttribLocation(this.program, 'a_position');
    this.program.matrix = gl.getUniformLocation(this.program, 'u_matrix');
    this.program.textureCoords = gl.getAttribLocation(this.program, 'a_textureCoords');

    // Copied from Three.js WebGLRenderer
    gl.disable(gl.DEPTH_TEST);

    // Setup some initial statements of the gl context
    gl.enable(gl.BLEND);

    // https://code.google.com/p/chromium/issues/detail?id=316393
    // gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, gl.TRUE);

    gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE, gl.ONE_MINUS_SRC_ALPHA );

  }

  setSize(width, height, ratio) {
    super.setSize(width, height);

    this.ratio = isUndefined(ratio) ? getRatio(this.ctx) : ratio;

    this.domElement.width = width * this.ratio;
    this.domElement.height = height * this.ratio;

    _.extend(this.domElement.style, {
      width: width + 'px',
      height: height + 'px'
    });

    width *= this.ratio;
    height *= this.ratio;

    // Set for this.stage parent scaling to account for HDPI
    this._renderer.matrix[0] = this._renderer.matrix[4] = this._renderer.scale = this.ratio;

    this._flagMatrix = true;

    this.ctx.viewport(0, 0, width, height);

    var resolutionLocation = this.ctx.getUniformLocation(
      this.program, 'u_resolution');
    this.ctx.uniform2f(resolutionLocation, width, height);

    return this;

  }

  render() {
    var gl = this.ctx;
    if (!this.overdraw) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    base.renderShape(this.scene, gl, this.program);
    this._flagMatrix = false;
    return this;
  }  
};




export default WebglRenderer;