var radialGradient = function(ctx) {

    this._update();

    if (!this._renderer.gradient || this._flagCenter || this._flagFocal
        || this._flagRadius || this._flagStops) {

      this._renderer.gradient = ctx.createRadialGradient(
        this.center._x, this.center._y, 0,
        this.focal._x, this.focal._y, this._radius
      );

      for (var i = 0; i < this.stops.length; i++) {
        var stop = this.stops[i];
        this._renderer.gradient.addColorStop(stop.offset, stop.color);
      }

    }

    return this.flagReset();

  }
export default radialGradient;