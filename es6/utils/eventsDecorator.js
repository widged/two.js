import _ from './underscore';

var slice = _.natural.slice;

var Events = {

        on: function(name, callback) {
          this._events || (this._events = {});
          var list = this._events[name] || (this._events[name] = []);
          list.push(callback);
          return this;

        },

        off: function(name, callback) {
          if (!this._events) {
            return this;
          }
          if (!name && !callback) {
            this._events = {};
            return this;
          }

          var names = name ? [name] : _.keys(this._events);
          for (var i = 0, l = names.length; i < l; i++) {

            var name = names[i];
            var list = this._events[name];

            if (!!list) {
              var events = [];
              if (callback) {
                for (var j = 0, k = list.length; j < k; j++) {
                  var ev = list[j];
                  if (callback && callback !== ev) {
                    events.push(ev);
                  }
                }
              }
              this._events[name] = events;
            }
          }

          return this;
        },

        trigger: function(name) {
          if (!this._events) return this;
          var args = slice.call(arguments, 1);
          var events = this._events[name];
          if (events) trigger(this, events, args);
          return this;
        }

      }

Events.bind  = Events.on;
Events.unbind = Events.off;

var trigger = function(obj, events, args) {
        var method;
        switch (args.length) {
        case 0:
          method = function(i) {
            events[i].call(obj, args[0]);
          };
          break;
        case 1:
          method = function(i) {
            events[i].call(obj, args[0], args[1]);
          };
          break;
        case 2:
          method = function(i) {
            events[i].call(obj, args[0], args[1], args[2]);
          };
          break;
        case 3:
          method = function(i) {
            events[i].call(obj, args[0], args[1], args[2], args[3]);
          };
          break;
        default:
          method = function(i) {
            events[i].apply(obj, args);
          };
        }
        for (var i = 0; i < events.length; i++) {
          method(i);
        }
      };
    
export default Events;