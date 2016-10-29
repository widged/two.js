import base from './base';


var radialGradient = function(domElement) {

        this._update();

        var changed = {};

        if (this._flagCenter) {
          changed.cx = this.center._x;
          changed.cy = this.center._y;
        }
        if (this._flagFocal) {
          changed.fx = this.focal._x;
          changed.fy = this.focal._y;
        }

        if (this._flagRadius) {
          changed.r = this._radius;
        }

        if (this._flagSpread) {
          changed.spreadMethod = this._spread;
        }

        // If there is no attached DOM element yet,
        // create it with all necessary attributes.
        if (!this._renderer.elem) {

          changed.id = this.id;
          changed.gradientUnits = 'userSpaceOnUse';
          this._renderer.elem = base.createElement('radialGradient', changed);
          domElement.defs.appendChild(this._renderer.elem);

        // Otherwise apply all pending attributes
        } else {

          base.setAttributes(this._renderer.elem, changed);

        }

        if (this._flagStops) {

          dom.removeChildNodes(this._renderer.elem);


          for (var i = 0; i < this.stops.length; i++) {

            var stop = this.stops[i];
            var attrs = {};

            if (stop._flagOffset) {
              attrs.offset = 100 * stop._offset + '%';
            }
            if (stop._flagColor) {
              attrs['stop-color'] = stop._color;
            }
            if (stop._flagOpacity) {
              attrs['stop-opacity'] = stop._opacity;
            }

            if (!stop._renderer.elem) {
              stop._renderer.elem = base.createElement('stop', attrs);
            } else {
              base.setAttributes(stop._renderer.elem, attrs);
            }

            this._renderer.elem.appendChild(stop._renderer.elem);
            stop.flagReset();

          }

        }

        return this.flagReset();

      }

export default radialGradient;