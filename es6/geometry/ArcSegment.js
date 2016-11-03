/* jshint esnext: true */

/**
 * arcSegment
 *
 * Defines an arc segment from center point ox, oy with an inner and outer radius
 * of iRadius, oRadius. Lastly, you need to supply a start and ending angle sAngle, eAngle. Optionally,
 * pass the resolution for how many points on the arc are desired.
 */

import Commands from '../constant/CommandTypes';

var PI = Math.PI, TWO_PI = Math.PI * 2, HALF_PI = Math.PI/2,
  cos = Math.cos, sin = Math.sin, abs = Math.abs;

const {MOVE, CURVE, CLOSE} = Commands;

/*
@function ArcSegment
  x : Origin X
  y : Origin Y
  iRadius : Inner Radius
  oRadius : Outer Radius
  sAngle : Starting Angle
  eAngle : Ending Angle
  resolution : Resolution
*/
function arcSegment(x, y, iRadius, oRadius, sAngle, eAngle, resolution) {

  resolution = resolution || 8;

  if (sAngle > eAngle) { eAngle += Math.PI*2; }
  var arc = eAngle - sAngle;
  var angleStep = arc / resolution;
  var points = [];

  points.push( [
    Math.sin(0) * oRadius,
    Math.cos(0) * oRadius,
    MOVE
  ]);

  //Do Outer Edge
  var outerTheta = (i, angleStep) => { return i * angleStep; };
  points = points.concat(edge(resolution, outerTheta, angleStep, HALF_PI, oRadius));
  //Do Inner Edge
  var innerTheta = (i, angleStep) => { return arc - (angleStep * i); };
  points = points.concat(edge(resolution, innerTheta, angleStep, PI*1.5, iRadius));

  points.push( [
    Math.sin(0) * oRadius,
    Math.cos(0) * oRadius,
    CLOSE
  ]);

  return {points, rotation: sAngle, translation: [x, y]};
}

var edge = (resolution, getTheta, angleStep, adj, radius) => {
  var x, y, lx, ly, rx, ry;
  var points = [];
  for (var i = 0, ni = resolution+1; i < ni; i++) {
    var theta = getTheta(i, angleStep);
    x = sin(theta) * radius;
    y = cos(theta) * radius;
    lx = sin(theta - adj) * (angleStep / PI) * radius;
    ly = cos(theta - adj) * (angleStep / PI) * radius;
    rx = sin(theta + adj) * (angleStep / PI) * radius;
    ry = cos(theta + adj) * (angleStep / PI) * radius;

    if (i===0)          { lx = ly = 0; }
    if (i===resolution) { rx = ry = 0; }

    points.push( [
      x, y,
      CURVE,
      {left: [lx, ly], right: [rx, ry]}
    ]);
  }

  return points;
};

export default arcSegment;
