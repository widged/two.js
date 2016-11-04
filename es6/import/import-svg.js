/* jshint esnext: true */

import is from '../util/is';
import _ from '../util/common';
import Resolution from '../constant/Resolution';
import Commands from '../constant/Commands';
import Path from '../shape/Anchor';
import Group from '../shape/Group';
import Gradient from '../shape/Gradient';
import RadialGradient from '../shape/gradient/RadialGradient';
import LinearGradient from '../shape/gradient/RadialGradient';
import Vector from '../struct/Vector';
import Matrix from '../struct/Matrix';
import pathFN  from '../shape/path-fn';
import Anchor from '../Anchor';

var {isObject, isUndefined, isNotNumber, isArray, isNull} = is;
var {getReflection, decomposeMatrix} = pathFN;
var {mod} = _;
var {pow, cos, sin} = Math;
var TWO_PI = Math.PI * 2;

/**
 * Walk through item properties and pick the ones of interest.
 * Will try to resolve styles applied via CSS
 *
 * TODO: Reverse calculate `Gradient`s for fill / stroke
 * of any given path.
 */
var applySvgAttributes = function(node, elem) {

  var attributes = {}, styles = {}, i, key, value, attr;

  // Not available in non browser environments
  if (getComputedStyle) {
    // Convert CSSStyleDeclaration to a normal object
    var computedStyles = getComputedStyle(node);
    i = computedStyles.length;

    while (i--) {
      key = computedStyles[i];
      value = computedStyles[key];
      // Gecko returns undefined for unset properties
      // Webkit returns the default value
      if (value !== undefined) {
        styles[key] = value;
      }
    }
  }

  // Convert NodeMap to a normal object
  i = node.attributes.length;
  while (i--) {
    attr = node.attributes[i];
    attributes[attr.nodeName] = attr.value;
  }

  // Getting the correct opacity is a bit tricky, since SVG path elements don't
  // support opacity as an attribute, but you can apply it via CSS.
  // So we take the opacity and set (stroke/fill)-opacity to the same value.
  if (!isUndefined(styles.opacity)) {
    styles['stroke-opacity'] = styles.opacity;
    styles['fill-opacity'] = styles.opacity;
  }

  // Merge attributes and applied styles (attributes take precedence)
  styles = Object.assign(styles, attributes);

  // Similarly visibility is influenced by the value of both display and visibility.
  // Calculate a unified value here which defaults to `true`.
  styles.visible = !(isUndefined(styles.display) && styles.display === 'none')
    || (isUndefined(styles.visibility) && styles.visibility === 'hidden');

  // Now iterate the whole thing
  for (key in styles) {
    value = styles[key];

    switch (key) {
      case 'transform':
        // TODO: Check this out https://github.com/paperjs/paper.js/blob/develop/src/svg/SvgImport.js#L313
        if (value === 'none') break;
        var m = node.getCTM();

        // Might happen when transform string is empty or not valid.
        if (m === null) break;

        // // Option 1: edit the underlying matrix and don't force an auto calc.
        // var m = node.getCTM();
        // matrix.manual = true;
        // matrix.set(m.a, m.b, m.c, m.d, m.e, m.f);

        // Option 2: Decompose and infer Two.js related properties.
        var transforms = decomposeMatrix(node.getCTM());

        elem.translation.set(transforms.translateX, transforms.translateY);
        elem.rotation = transforms.rotation;
        // Warning: Two.js elements only support uniform scalars...
        elem.scale = transforms.scaleX;

        // Override based on attributes.
        if (styles.x) {
          elem.translation.x = styles.x;
        }

        if (styles.y) {
          elem.translation.y = styles.y;
        }

        break;
      case 'visible':
        elem.visible = value;
        break;
      case 'stroke-linecap':
        elem.cap = value;
        break;
      case 'stroke-linejoin':
        elem.join = value;
        break;
      case 'stroke-miterlimit':
        elem.miter = value;
        break;
      case 'stroke-width':
        elem.linewidth = parseFloat(value);
        break;
      case 'stroke-opacity':
      case 'fill-opacity':
      case 'opacity':
        elem.opacity = parseFloat(value);
        break;
      case 'fill':
      case 'stroke':
        if (/url\(\#.*\)/i.test(value)) {
          // getById is a function of a group instance
          elem[key] = this.getById(
            value.replace(/url\(\#(.*)\)/i, '$1'));
        } else {
          elem[key] = (value === 'none') ? 'transparent' : value;
        }
        break;
      case 'id':
        elem.id = value;
        break;
      case 'class':
        elem.classList = value.split(' ');
        break;
    }
  }

  return elem;

};


/**
interpret two.interpret(svgNode);
Reads an svg node and draws the svg object by creating `Paths` and `Groups`
from the reference. It then adds it to the instance's drawing space. It returns
a `Group` object.
*/
/**
 * Interpret an SVG Node and add it to this instance's scene. The
 * distinction should be made that this doesn't `import` svg's, it solely
 * interprets them into something compatible for Two.js — this is slightly
 * different than a direct transcription.
 *
 * @param {Object} svgNode - The node to be parsed
 * @param {Boolean} shallow - Don't create a top-most group but
 *                                    append all contents directly
 */
var interpret = function(svgNode, shallow) {
  // check wether this is actually a svg file
  var tag = svgNode.tagName.toLowerCase();
  if (!(tag in tags)) { return null; }

  var node = tags[tag].call(this, svgNode);

  var shape;
  if (shallow && node instanceof Group) {
    shape = node.children;
  } else {
    shape = node;
  }
  return {node, shape};
};


/**
 * Load an SVG file / text and interpret.
 */
var load = function(text, callback) {

  var dom = require('./platform/dom').default;

  var nodes = [], elem, i;

  if (/.*\.svg/ig.test(text)) {
    var xhr = require('./platform/xhr').default;

    xhr(text, (data) => {

      dom.temp.innerHTML = data;
      for (i = 0; i < dom.temp.children.length; i++) {
        elem = dom.temp.children[i];
        nodes.push(interpret(elem));
      }

      callback(nodes.length <= 1 ? nodes[0] : nodes,
        dom.temp.children.length <= 1 ? dom.temp.children[0] : dom.temp.children);

    });

    return;

  } else {

    dom.temp.innerHTML = text;
    for (i = 0; i < dom.temp.children.length; i++) {
      elem = dom.temp.children[i];
      nodes.push(interpret(elem));
    }

    callback(nodes.length <= 1 ? nodes[0] : nodes,
      dom.temp.children.length <= 1 ? dom.temp.children[0] : dom.temp.children);

    return;

  }
};

/**
 * Read any number of SVG node types and create Two equivalents of them.
 */
var tags = {

  svg: function() {
    return tags.g.apply(this, arguments);
  },

  g: function(node) {

    var group = new Group();

    // Switched up order to inherit more specific styles
    applySvgAttributes.call(this, node, group);

    for (var i = 0, l = node.childNodes.length; i < l; i++) {
      var n = node.childNodes[i];
      var tag = n.nodeName;
      if (!tag) return;

      var tagName = tag.replace(/svg\:/ig, '').toLowerCase();

      if (tagName in tags) {
        var o = tags[tagName].call(group, n);
        group.add(o);
      }
    }

    return group;

  },

  polygon: function(node, open) {


    var points = node.getAttribute('points');

    var verts = [];
    points.replace(/(-?[\d\.?]+),(-?[\d\.?]+)/g, function(match, p1, p2) {
      verts.push(new Anchor(parseFloat(p1), parseFloat(p2)));
    });

    var poly = new Path(verts, !open).noStroke();
    poly.fill = 'black';

    return applySvgAttributes.call(this, node, poly);

  },

  polyline: function(node) {
    return tags.polygon.call(this, node, true);
  },

  path: function(node) {

    var path = node.getAttribute('d');

    // Create a Path from the paths.

    var coord = new Anchor();
    var control, coords;
    var closed = false, relative = false;
    var commands = path.match(/[a-df-z][^a-df-z]*/ig);
    var last = commands.length - 1;

    // Split up polybeziers

    commands.slice(0).forEach(function(command, i) {

      var type = command[0];
      var lower = type.toLowerCase();
      var items = command.slice(1).trim().split(/[\s,]+|(?=\s?[+\-])/);
      var pre, post, result = [], bin;

      if (i <= 0) {
        commands = [];
      }

      switch (lower) {
        case 'h':
        case 'v':
          if (items.length > 1) {
            bin = 1;
          }
          break;
        case 'm':
        case 'l':
        case 't':
          if (items.length > 2) {
            bin = 2;
          }
          break;
        case 's':
        case 'q':
          if (items.length > 4) {
            bin = 4;
          }
          break;
        case 'c':
          if (items.length > 6) {
            bin = 6;
          }
          break;
        case 'a':
          // TODO: Handle Ellipses
          break;
      }

      if (bin) {

        for (var j = 0, l = items.length, times = 0; j < l; j+=bin) {

          var ct = type;
          if (times > 0) {

            switch (type) {
              case 'm':
                ct = 'l';
                break;
              case 'M':
                ct = 'L';
                break;
            }

          }

          result.push([ct].concat(items.slice(j, j + bin)).join(' '));
          times++;

        }

        commands = Array.prototype.concat.apply(commands, result);

      } else {

        commands.push(command);

      }

    });

    // Create the vertices for our Path

    var points = [];
    commands.forEach(function(command, i) {

      var result, x, y;
      var type = command[0];
      var lower = type.toLowerCase();

      coords = command.slice(1).trim();
      coords = coords.replace(/(-?\d+(?:\.\d*)?)[eE]([+\-]?\d+)/g, function(match, n1, n2) {
        return parseFloat(n1) * pow(10, n2);
      });
      coords = coords.split(/[\s,]+|(?=\s?[+\-])/);
      relative = type === lower;

      var x1, y1, x2, y2, x3, y3, x4, y4, reflection;

      switch (lower) {

        case 'z':
          if (i >= last) {
            closed = true;
          } else {
            x = coord.x;
            y = coord.y;
            result = new Anchor(
              x, y,
              Commands.CLOSE
            );
          }
          break;

        case 'm':
        case 'l':

          x = parseFloat(coords[0]);
          y = parseFloat(coords[1]);

          result = new Anchor(
            x, y,
            lower === 'm' ? Commands.MOVE : Commands.LINE
          );

          if (relative) {
            result.addSelf(coord);
          }

          // result.controls.left.copy(result);
          // result.controls.right.copy(result);

          coord = result;
          break;

        case 'h':
        case 'v':

          var a = lower === 'h' ? 'x' : 'y';
          var b = a === 'x' ? 'y' : 'x';

          result = new Anchor(
            0, 0,
            Commands.LINE
          );
          result[a] = parseFloat(coords[0]);
          result[b] = coord[b];

          if (relative) {
            result[a] += coord[a];
          }

          // result.controls.left.copy(result);
          // result.controls.right.copy(result);

          coord = result;
          break;

        case 'c':
        case 's':

          x1 = coord.x;
          y1 = coord.y;

          if (!control) {
            control = new Vector();//.copy(coord);
          }

          if (lower === 'c') {

            x2 = parseFloat(coords[0]);
            y2 = parseFloat(coords[1]);
            x3 = parseFloat(coords[2]);
            y3 = parseFloat(coords[3]);
            x4 = parseFloat(coords[4]);
            y4 = parseFloat(coords[5]);

          } else {

            // Calculate reflection control point for proper x2, y2
            // inclusion.

            reflection = getReflection(coord, control, relative);

            x2 = reflection.x;
            y2 = reflection.y;
            x3 = parseFloat(coords[0]);
            y3 = parseFloat(coords[1]);
            x4 = parseFloat(coords[2]);
            y4 = parseFloat(coords[3]);

          }

          if (relative) {
            x2 += x1;
            y2 += y1;
            x3 += x1;
            y3 += y1;
            x4 += x1;
            y4 += y1;
          }

          if (!isObject(coord.controls)) {
            Anchor.AppendCurveProperties(coord);
          }

          coord.controls.right.set(x2 - coord.x, y2 - coord.y);
          result = new Anchor(
            x4, y4,
            Commands.CURVE,
            {left: [x3 - x4, y3 - y4], right: [undefined, undefined]}
          );

          coord = result;
          control = result.controls.left;

          break;

        case 't':
        case 'q':

          x1 = coord.x;
          y1 = coord.y;

          if (!control) {
            control = new Vector();//.copy(coord);
          }

          if (control.isZero()) {
            x2 = x1;
            y2 = y1;
          } else {
            x2 = control.x;
            y1 = control.y;
          }

          if (lower === 'q') {

            x3 = parseFloat(coords[0]);
            y3 = parseFloat(coords[1]);
            x4 = parseFloat(coords[1]);
            y4 = parseFloat(coords[2]);

          } else {

            reflection = getReflection(coord, control, relative);

            x3 = reflection.x;
            y3 = reflection.y;
            x4 = parseFloat(coords[0]);
            y4 = parseFloat(coords[1]);

          }

          if (relative) {
            x2 += x1;
            y2 += y1;
            x3 += x1;
            y3 += y1;
            x4 += x1;
            y4 += y1;
          }

          if (!isObject(coord.controls)) {
            Anchor.AppendCurveProperties(coord);
          }

          coord.controls.right.set(x2 - coord.x, y2 - coord.y);
          result = new Anchor(
            x4, y4,
            Commands.CURVE,
            {left: [x3 - x4, y3 - y4], right: [undefined, undefined]}
          );

          coord = result;
          control = result.controls.left;

          break;

        case 'a':

          // throw new TwoError('not yet able to interpret Elliptical Arcs.');
          x1 = coord.x;
          y1 = coord.y;

          var rx = parseFloat(coords[0]);
          var ry = parseFloat(coords[1]);
          var xAxisRotation = parseFloat(coords[2]) * Math.PI / 180;
          var largeArcFlag = parseFloat(coords[3]);
          var sweepFlag = parseFloat(coords[4]);

          x4 = parseFloat(coords[5]);
          y4 = parseFloat(coords[6]);

          if (relative) {
            x4 += x1;
            y4 += y1;
          }

          // http://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter

          // Calculate midpoint mx my
          var mx = (x4 - x1) / 2;
          var my = (y4 - y1) / 2;

          // Calculate x1' y1' F.6.5.1
          var _x = mx * cos(xAxisRotation) + my * sin(xAxisRotation);
          var _y = - mx * sin(xAxisRotation) + my * cos(xAxisRotation);

          var rx2 = rx * rx;
          var ry2 = ry * ry;
          var _x2 = _x * _x;
          var _y2 = _y * _y;

          // adjust radii
          var l = _x2 / rx2 + _y2 / ry2;
          if (l > 1) {
            rx *= Math.sqrt(l);
            ry *= Math.sqrt(l);
          }

          var amp = Math.sqrt((rx2 * ry2 - rx2 * _y2 - ry2 * _x2) / (rx2 * _y2 + ry2 * _x2));

          if (isNotNumber(amp)) {
            amp = 0;
          } else if (largeArcFlag != sweepFlag && amp > 0) {
            amp *= -1;
          }

          // Calculate cx' cy' F.6.5.2
          var _cx = amp * rx * _y / ry;
          var _cy = - amp * ry * _x / rx;

          // Calculate cx cy F.6.5.3
          var cx = _cx * cos(xAxisRotation) - _cy * sin(xAxisRotation) + (x1 + x4) / 2;
          var cy = _cx * sin(xAxisRotation) + _cy * cos(xAxisRotation) + (y1 + y4) / 2;

          // vector magnitude
          var m = function(v) { return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2)); };
          // ratio between two vectors
          var r = function(u, v) { return (u[0] * v[0] + u[1] * v[1]) / (m(u) * m(v)); };
          // angle between two vectors
          var a = function(u, v) { return (u[0] * v[1] < u[1] * v[0] ? - 1 : 1) * Math.acos(r(u,v)); };

          // Calculate theta1 and delta theta F.6.5.4 + F.6.5.5
          var t1 = a([1, 0], [(_x - _cx) / rx, (_y - _cy) / ry]);
          var u = [(_x - _cx) / rx, (_y - _cy) / ry];
          var v = [( - _x - _cx) / rx, ( - _y - _cy) / ry];
          var dt = a(u, v);

          if (r(u, v) <= -1) dt = Math.PI;
          if (r(u, v) >= 1) dt = 0;

          // F.6.5.6
          if (largeArcFlag)  {
            dt = mod(dt, Math.PI * 2);
          }

          if (sweepFlag && dt > 0) {
            dt -= Math.PI * 2;
          }

          var length = Resolution;

          // Save a projection of our rotation and translation to apply
          // to the set of points.
          var projection = new Matrix()
            .translate(cx, cy)
            .rotate(xAxisRotation);

          // Create a resulting array of Anchor's to export to the
          // the path.


          result = [];
          for (var i = 0; i < length; i++) {
            var pct = 1 - (i / (length - 1));
            var theta = pct * dt + t1;
            var xx = rx * cos(theta);
            var yy = ry * sin(theta);
            var projected = projection.multiply(xx, yy, 1);
            result.push(new Anchor(
              projected.x, projected.y, Commands.LINE));
          }
          result.push(new Anchor(x4, y4, Commands.LINE));

          coord = result[result.length - 1];
          control = coord.controls.left;

          break;

      }

      if (result) {
        if (isArray(result)) {
          points = points.concat(result);
        } else {
          points.push(result);
        }
      }

    });

    if (points.length <= 1) {
      return;
    }

    var poly = new Path(points, closed, undefined, true).noStroke();
    poly.fill = 'black';

    return applySvgAttributes.call(this, node, poly);

  },

   // a lot of redundancy with geometry/Ellipse
  circle: function(node) {

    var x = parseFloat(node.getAttribute('cx'));
    var y = parseFloat(node.getAttribute('cy'));
    var r = parseFloat(node.getAttribute('r'));

    var amount = Resolution;
    var points = [];
    for (var i = 0; i < amount; i++) {
      var pct = i / amount;
      var theta = pct * TWO_PI;
      points.push(Anchor(r * cos(theta), r * sin(theta)));
    }

    var circle = new Path(points, true, true).noStroke();
    circle.translation.set(x, y);
    circle.fill = 'black';

    return applySvgAttributes.call(this, node, circle);

  },

   // a lot of redundancy with geometry/Ellipse
  ellipse: function(node) {


    var x = parseFloat(node.getAttribute('cx'));
    var y = parseFloat(node.getAttribute('cy'));
    var width = parseFloat(node.getAttribute('rx'));
    var height = parseFloat(node.getAttribute('ry'));

    var amount = Resolution;
    var points = [];
    for (var i = 0; i < amount; i++) {
      var pct = i / amount;
      var theta = pct * TWO_PI;
      var xx = width * cos(theta);
      var yy = height * sin(theta);
      points.push(Anchor(xx, yy));
    }

    var ellipse = new Path(points, true, true).noStroke();
    ellipse.translation.set(x, y);
    ellipse.fill = 'black';

    return applySvgAttributes.call(this, node, ellipse);

  },

   // a lot of redundancy with geometry/Rectangle
  rect: function(node) {

    var x = parseFloat(node.getAttribute('x')) || 0;
    var y = parseFloat(node.getAttribute('y')) || 0;
    var width = parseFloat(node.getAttribute('width'));
    var height = parseFloat(node.getAttribute('height'));

    var w2 = width / 2;
    var h2 = height / 2;

    var points = [
      new Anchor(w2, h2),
      new Anchor(-w2, h2),
      new Anchor(-w2, -h2),
      new Anchor(w2, -h2)
    ];

    var rect = new Path(points, true).noStroke();
    rect.translation.set(x + w2, y + h2);
    rect.fill = 'black';

    return applySvgAttributes.call(this, node, rect);

  },

  line: function(node) {

    var x1 = parseFloat(node.getAttribute('x1'));
    var y1 = parseFloat(node.getAttribute('y1'));
    var x2 = parseFloat(node.getAttribute('x2'));
    var y2 = parseFloat(node.getAttribute('y2'));

    var width = x2 - x1;
    var height = y2 - y1;

    var w2 = width / 2;
    var h2 = height / 2;

    var points = [
      new Anchor(- w2, - h2),
      new Anchor(w2, h2)
    ];

    // Center line and translate to desired position.

    var line = new Path(points).noFill();
    line.translation.set(x1 + w2, y1 + h2);

    return applySvgAttributes.call(this, node, line);

  },

  lineargradient: function(node) {

    var x1 = parseFloat(node.getAttribute('x1'));
    var y1 = parseFloat(node.getAttribute('y1'));
    var x2 = parseFloat(node.getAttribute('x2'));
    var y2 = parseFloat(node.getAttribute('y2'));

    var ox = (x2 + x1) / 2;
    var oy = (y2 + y1) / 2;

    var stops = [];
    for (var i = 0; i < node.children.length; i++) {

      var child = node.children[i];

      var offset = parseFloat(child.getAttribute('offset'));
      var color = child.getAttribute('stop-color');
      var opacity = child.getAttribute('stop-opacity');
      var style = child.getAttribute('style');

      if (isNull(color)) {
        color = (style.match(/stop\-color\:\s?([\#a-fA-F0-9]*)/) || [])[1];
      }

      if (isNull(opacity)) {
        opacity = (style.match(/stop\-opacity\:\s?([0-9\.\-]*)/) || [])[1];
      }

      stops.push(new Gradient.Stop(offset, color, opacity));

    }

    var gradient = new LinearGradient(x1 - ox, y1 - oy, x2 - ox,
      y2 - oy, stops);

    return applySvgAttributes.call(this, node, gradient);

  },

  radialgradient: function(node) {

    var cx = parseFloat(node.getAttribute('cx')) || 0;
    var cy = parseFloat(node.getAttribute('cy')) || 0;
    var r = parseFloat(node.getAttribute('r'));

    var fx = parseFloat(node.getAttribute('fx'));
    var fy = parseFloat(node.getAttribute('fy'));

    if (isNotNumber(fx)) {
      fx = cx;
    }

    if (isNotNumber(fy)) {
      fy = cy;
    }

    var ox = Math.abs(cx + fx) / 2;
    var oy = Math.abs(cy + fy) / 2;

    var stops = [];
    for (var i = 0; i < node.children.length; i++) {

      var child = node.children[i];

      var offset = parseFloat(child.getAttribute('offset'));
      var color = child.getAttribute('stop-color');
      var opacity = child.getAttribute('stop-opacity');
      var style = child.getAttribute('style');

      if (isNull(color)) {
        color = (style.match(/stop\-color\:\s?([\#a-fA-F0-9]*)/) || [])[1];
      }

      if (isNull(opacity)) {
        opacity = (style.match(/stop\-opacity\:\s?([0-9\.\-]*)/) || [])[1];
      }

      stops.push(new Gradient.Stop(offset, color, opacity));

    }

    var gradient = new RadialGradient(cx - ox, cy - oy, r,
      stops, fx - ox, fy - oy);

    return applySvgAttributes.call(this, node, gradient);

  }

};

export default {interpret, load};
