/* jshint esnext: true */

import util from '../../TwoUtil';

import Commands from './CommandTypes';

var {CLOSE, CURVE, MOVE, LINE} = Commands;
var {mod, toFixed} = util;
var {min, max} = Math;

var FN = {};

FN.curveSegment = (a, b) => {
  var ar, bl, vx, vy, ux, uy;
  ar = (a.controls && a.controls.right) || a;
  bl = (b.controls && b.controls.left) || b;

  if (a.relative) {
    vx = toFixed((ar.x + a.x));
    vy = toFixed((ar.y + a.y));
  } else {
    vx = toFixed(ar.x);
    vy = toFixed(ar.y);
  }

  if (b.relative) {
    ux = toFixed((bl.x + b.x));
    uy = toFixed((bl.y + b.y));
  } else {
    ux = toFixed(bl.x);
    uy = toFixed(bl.y);
  }
  return [vx, vy, ux, uy];
};

/**
 * Updates a Rect to include an additional anchor. Typically takes anchors that are
 * "centered" around 0 and returns them to be anchored upper-left.
 */
FN.includeAnchorInBoundingRect = (acc, {x,y,controls,_relative:relative}) => {
  var a, b, c, d;
  var {left, right, top, bottom} = acc || {left : Infinity, right : -Infinity, top : Infinity, bottom : -Infinity};

  if (controls) {
    var cl = controls.left,
        cr = controls.right;

    if (cl && cr) {
      a = relative ? cl.x + x : cl.x;
      b = relative ? cl.y + y : cl.y;
      c = relative ? cr.x + x : cr.x;
      d = relative ? cr.y + y : cr.y;
    }
  }

  if (a && b && c && d) {
    top    = min(b, d, top);
    left   = min(a, c, left);
    right  = max(a, c, right);
    bottom = max(b, d, bottom);
  } else {
    top    = min(y, top);
    left   = min(x, left);
    right  = max(x, right);
    bottom = max(y, bottom);
  }

  return {left, right, top, bottom};
};

/**
 * Turn a set of vertices into a string for the d property of a path
 * element. It is imperative that the string collation is as fast as
 * possible, because this call will be happening multiple times a
 * second.
 */
FN.toString = function(anchors, closed) {

  var l = anchors.length,
   last = l - 1,
   d, // The elusive last Commands.MOVE point
   ret = '';

  for (var i = 0; i < l; i++) {
   var b = anchors[i];
   var command;
   var prev = closed ? mod(i - 1, l) : Math.max(i - 1, 0);
   var next = closed ? mod(i + 1, l) : Math.min(i + 1, last);

   var a = anchors[prev];
   var c = anchors[next];

   var vx, vy, ux, uy, ar, bl, br, cl;

   // Access x and y directly,
   // bypassing the getter
   var x = toFixed(b.x);
   var y = toFixed(b.y);

   switch (b.command) {

     case CLOSE:
       command = CLOSE;
       break;

     case CURVE:

       ar = (a.controls && a.controls.right) || a;
       bl = (b.controls && b.controls.left) || b;

       if (a.relative) {
         vx = toFixed((ar.x + a.x));
         vy = toFixed((ar.y + a.y));
       } else {
         vx = toFixed(ar.x);
         vy = toFixed(ar.y);
       }

       if (b.relative) {
         ux = toFixed((bl.x + b.x));
         uy = toFixed((bl.y + b.y));
       } else {
         ux = toFixed(bl.x);
         uy = toFixed(bl.y);
       }

       command = ((i === 0) ? MOVE : CURVE) +
         ' ' + vx + ' ' + vy + ' ' + ux + ' ' + uy + ' ' + x + ' ' + y;
       break;

     case MOVE:
       d = b;
       command = MOVE + ' ' + x + ' ' + y;
       break;

     default:
       command = b.command + ' ' + x + ' ' + y;

   }

   // Add a final point and close it off

   if (i >= last && closed) {

     if (b.command === CURVE) {

       // Make sure we close to the most previous MOVE
       c = d;

       br = (b.controls && b.controls.right) || b;
       cl = (c.controls && c.controls.left) || c;

       if (b.relative) {
         vx = toFixed((br.x + b.x));
         vy = toFixed((br.y + b.y));
       } else {
         vx = toFixed(br.x);
         vy = toFixed(br.y);
       }

       if (c.relative) {
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

};


export default FN;
