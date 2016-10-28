import Commands from '../constants/CommandTypes';

var PI = Math.PI, TWO_PI = Math.PI * 2, HALF_PI = Math.PI/2,
  cos = Math.cos, sin = Math.sin, abs = Math.abs;

/*
@function ArcSegment
  ox : Origin X
  oy : Origin Y
  ir : Inner Radius
  or : Outer Radius
  sa : Starting Angle
  ea : Ending Angle
  res : Resolution
*/
function arcSegment(ox, oy, ir, or, sa, ea, res) {

  if (sa > ea) {
    ea += Math.PI*2;
  }

  res = res || 8;

  var rot = sa;
  var ta = ea - sa;
  var angleStep = ta / res;
  var command = Commands.move;
  var points = [];

  points.push( [
    Math.sin(0) * or,
    Math.cos(0) * or,
    0,0,0,0,
    command
  ]);


  var theta, x, y, lx, ly, rx, ry;
  command = Commands.curve;

  //Do Outer Edge
  for (var i = 0; i < res+1; i++) {

    theta = i * angleStep;
    x = sin(theta) * or;
    y = cos(theta) * or;
    lx = sin(theta - HALF_PI) * (angleStep / PI) * or;
    ly = cos(theta - HALF_PI) * (angleStep / PI) * or;
    rx = sin(theta + HALF_PI) * (angleStep / PI) * or;
    ry = cos(theta + HALF_PI) * (angleStep / PI) * or;

    if (i===0) {
      lx = ly = 0;
    }

    if (i===res) {
      rx = ry = 0;
    }

    points.push( [
      x, y, lx, ly, rx, ry, command
    ]);
  }

  //Do Inner Edge
  for (var j = 0; j < res+1; j++) {

    theta = ta - (angleStep * j);
    x = sin(theta) * ir;
    y = cos(theta) * ir;
    lx = sin(theta - (PI*1.5)) * (angleStep / PI) * ir;
    ly = cos(theta - (PI*1.5)) * (angleStep / PI) * ir;
    rx = sin(theta + (PI*1.5)) * (angleStep / PI) * ir;
    ry = cos(theta + (PI*1.5)) * (angleStep / PI) * ir;

    if (j===0) {
      lx = ly = 0;
    }

    if (j===res) {
      rx = ry = 0;
    }

    points.push( [
      x, y, lx, ly, rx, ry, command
    ]);
  }

  command = Commands.close
  points.push( [
    Math.sin(0) * or,
    Math.cos(0) * or,
    0,0,0,0,
    command
  ]);

  return {points, rotation: sa, translation: [ox, oy]}
}


export default arcSegment;