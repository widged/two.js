/* jshint esnext: true */

import base from './base';


var radialGradient = {

  render: function(ctx, elem) {

    if (!ctx.canvas.getContext('2d')) {
      return;
    }

    this._update();

    if (!this._renderer.gradient || this._flag_center || this._flag_focal
        || this._flag_radius || this._flag_stops) {

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

};

export default radialGradient;
