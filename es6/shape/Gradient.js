import _  from '../utils/utils';
import EventTypes    from '../constants/EventTypes';
import Stop      from './Stop';
import Shape     from './Shape';
import Collection  from '../utils/Collection';


  var Gradient = function(stops) {

    Shape.call(this);

    this._renderer.type = 'gradient';

    this.spread = 'pad';

    this.stops = stops;

  };

  _.extend(Gradient, {

    Stop: Stop,

    Properties: [
      'spread'
    ],

    MakeObservable: function(object) {

      Shape.MakeObservable(object);

      _.each(Gradient.Properties, _.defineProperty, object);

      Object.defineProperty(object, 'stops', {

        enumerable: true,

        get: function() {
          return this._stops;
        },

        set: function(stops) {

          var updateStops = _.bind(Gradient.FlagStops, this);

          var bindStops = _.bind(function(items) {

            // This function is called a lot
            // when importing a large SVG
            var i = items.length;
            while(i--) {
              items[i].bind(EventTypes.change, updateStops);
            }

            updateStops();

          }, this);

          var unbindStops = _.bind(function(items) {

            _.each(items, function(v) {
              v.unbind(EventTypes.change, updateStops);
            }, this);

            updateStops();

          }, this);

          // Remove previous listeners
          if (this._stops) {
            this._stops.unbind();
          }

          // Create new Collection with copy of Stops
          this._stops = new Collection((stops || []).slice(0));

          // Listen for Collection changes and bind / unbind
          this._stops.bind(EventTypes.insert, bindStops);
          this._stops.bind(EventTypes.remove, unbindStops);

          // Bind Initial Stops
          bindStops(this._stops);

        }

      });

    },

    FlagStops: function() {
      this._flagStops = true;
    }

  });

  _.extend(Gradient.prototype, Shape.prototype, {

    clone: function(parent) {

      parent = parent || this.parent;

      var stops = _.map(this.stops, function(s) {
        return s.clone();
      });

      var clone = new Gradient(stops);

      _.each(Gradient.Properties, function(k) {
        clone[k] = this[k];
      }, this);

      clone.translation.copy(this.translation);
      clone.rotation = this.rotation;
      clone.scale = this.scale;

      parent.add(clone);

      return clone;

    },

    toObject: function() {

      var result = {
        stops: _.map(this.stops, function(s) {
          return s.toObject();
        })
      };

      _.each(Gradient.Properties, function(k) {
        result[k] = this[k];
      }, this);

      return result;

    },

    flagReset: function() {

      this._flagSpread = this._flagStops = false;

      Shape.prototype.flagReset.call(this);

      return this;

    }

  });

  Gradient.MakeObservable(Gradient.prototype);

export default Gradient;