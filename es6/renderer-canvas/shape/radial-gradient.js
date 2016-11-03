/* jshint esnext: true */

var radialGradient = function(canvasContext) {

  this._update();

  if (!this._renderer.gradient || this._flag_center || this._flag_focal
      || this._flag_radius || this._flag_stops) {

    this._renderer.gradient = canvasContext.createRadialGradient(
      this.center.x, this.center.y, 0,
      this.focal.x, this.focal.y, this._radius
    );

    for (var i = 0; i < this.stops.length; i++) {
      var stop = this.stops[i];
      this._renderer.gradient.addColorStop(stop.offset, stop.color);
    }

  }

  return this.flagReset();

};

export default radialGradient;
