/* jshint esnext: true */

var linearGradient = function(ctx) {

  this._update();

  if (!this._renderer.gradient || this._flag_endPoints || this._flag_stops) {

    this._renderer.gradient = ctx.createLinearGradient(
      this.left.x, this.left.y,
      this.right.x, this.right.y
    );

    for (var i = 0; i < this.stops.length; i++) {
      var stop = this.stops[i];
      this._renderer.gradient.addColorStop(stop.offset, stop.color);
    }

  }

  return this.flagReset();

};


export default linearGradient;
