/* jshint esnext: true */

import _  from '../../util/common';
import Cache   from '../../util/Cache';
import Commands from '../../constant/CommandTypes';

var {mod, toFixed} = _;

var ns = 'http://www.w3.org/2000/svg';
var xlink = 'http://www.w3.org/1999/xlink';

var FN = {};

FN.version = 1.1;

FN.Commands = Commands;

// ------------------------------------
//  Interface
// ------------------------------------

var shapeCache = new Cache((key) => { return require('./' + key).default; });

FN.renderShape = (elm, ctx, condi, clip) => {
  var type = elm._renderer.type;
  shapeCache.get(type).call(elm, ctx, condi, clip);
};


// ------------------------------------
//  Utilities available to all shapes
// ------------------------------------

/**
 * Create an svg namespaced element.
 */
FN.createElement = function(name, attrs) {
  var tag = name;
  var elem = document.createElementNS(ns, tag);
  if (tag === 'svg') {
    attrs = Object.assign(attrs || {}, { version: this.version });
  }
  FN.setAttributes(elem, attrs);
  return elem;
};

/**
 * Add attributes from an svg element.
 */
FN.setAttributes = function(elem, attrs) {
  if (!attrs || Object.keys(attrs).length === 0) { return; }
  var keys = Object.keys(attrs);
  for (var i = 0; i < keys.length; i++) {
    elem.setAttribute(keys[i], attrs[keys[i]]);
  }
};

/**
 * Remove attributes from an svg element.
 */
FN.removeAttributes = function(elem, attrs) {
  for (var key in attrs) {
    elem.removeAttribute(key);
  }
  return this;
}

/**
 *
 */
FN.getClip = function(shape) {

  var clip = shape._renderer.clip;

  if (!clip) {

    var root = shape;

    while (root.parent) {
      root = root.parent;
    }

    clip = shape._renderer.clip = FN.createElement('clipPath');
    root.defs.appendChild(clip);

  }

  return clip;

};

/**
 * Turn a set of vertices into a string for the d property of a path
 * element. It is imperative that the string collation is as fast as
 * possible, because this call will be happening multiple times a
 * second.
 */
FN.toString = function(points, closed) {

  var l = points.length,
    last = l - 1,
    d, // The elusive last Commands.move point
    ret = '';

  for (var i = 0; i < l; i++) {
    var b = points[i];
    var command;
    var prev = closed ? mod(i - 1, l) : Math.max(i - 1, 0);
    var next = closed ? mod(i + 1, l) : Math.min(i + 1, last);

    var a = points[prev];
    var c = points[next];

    var vx, vy, ux, uy, ar, bl, br, cl;

    // Access x and y directly,
    // bypassing the getter
    var x = toFixed(b._x);
    var y = toFixed(b._y);

    switch (b._command) {

      case Commands.close:
        command = Commands.close;
        break;

      case Commands.curve:

        ar = (a.controls && a.controls.right) || a;
        bl = (b.controls && b.controls.left) || b;

        if (a._relative) {
          vx = toFixed((ar.x + a.x));
          vy = toFixed((ar.y + a.y));
        } else {
          vx = toFixed(ar.x);
          vy = toFixed(ar.y);
        }

        if (b._relative) {
          ux = toFixed((bl.x + b.x));
          uy = toFixed((bl.y + b.y));
        } else {
          ux = toFixed(bl.x);
          uy = toFixed(bl.y);
        }

        command = ((i === 0) ? Commands.move : Commands.curve) +
          ' ' + vx + ' ' + vy + ' ' + ux + ' ' + uy + ' ' + x + ' ' + y;
        break;

      case Commands.move:
        d = b;
        command = Commands.move + ' ' + x + ' ' + y;
        break;

      default:
        command = b._command + ' ' + x + ' ' + y;

    }

    // Add a final point and close it off

    if (i >= last && closed) {

      if (b._command === Commands.curve) {

        // Make sure we close to the most previous Commands.move
        c = d;

        br = (b.controls && b.controls.right) || b;
        cl = (c.controls && c.controls.left) || c;

        if (b._relative) {
          vx = toFixed((br.x + b.x));
          vy = toFixed((br.y + b.y));
        } else {
          vx = toFixed(br.x);
          vy = toFixed(br.y);
        }

        if (c._relative) {
          ux = toFixed((cl.x + c.x));
          uy = toFixed((cl.y + c.y));
        } else {
          ux = toFixed(cl.x);
          uy = toFixed(cl.y);
        }

        x = toFixed(c.x);
        y = toFixed(c.y);

        command +=
          ' C ' + vx + ' ' + vy + ' ' + ux + ' ' + uy + ' ' + x + ' ' + y;
      }

      command += ' Z';

    }

    ret += command + ' ';

  }

  return ret;

}

export default FN;
