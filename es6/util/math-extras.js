var FN = {};
var NotInUse = {};

// A pretty fast toFixed(3) alternative
// See http://jsperf.com/parsefloat-tofixed-vs-math-round/18
FN.toFixed = (v) => {
  return Math.floor(v * 1000) / 1000;
}

FN.mod = (v, l) => {
  while (v < 0) { v += l; }
  return v % l;
};


FN.angleBetween = (A, B)  => {

  var {atan2} = Math;

  var dx, dy;

  if (arguments.length >= 4) {

    dx = arguments[0] - arguments[2];
    dy = arguments[1] - arguments[3];

    return atan2(dy, dx);

  }

  dx = A.x - B.x;
  dy = A.y - B.y;

  return atan2(dy, dx);

}

FN.distanceBetween = (p1, p2)  => {
  var dx = p1.x - p2.x;
  var dy = p1.y - p2.y;
  var squared = dx * dx + dy * dy;
  return Math.sqrt(squared);
}

NotInUse.ratioBetween = (A, B)  => {
  return (A.x * B.x + A.y * B.y) / (A.length() * B.length());
}

export default FN;