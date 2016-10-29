import _ from './util/common';
import is from './util/is';

var {isFunction} = is;

var FN = _.extend(_, {

    /**
     * Release an arbitrary class' events from the two.js corpus and recurse
     * through its children and or vertices.
     */
    release: function(obj) {

      if (!is.Object(obj)) {
        return;
      }

      if (isFunction(obj.unbind)) {
        obj.unbind();
      }

      if (obj.vertices) {
        if (isFunction(obj.vertices.unbind)) {
          obj.vertices.unbind();
        }
        _.each(obj.vertices, function(v) {
          if (isFunction(v.unbind)) {
            v.unbind();
          }
        });
      }

      if (obj.children) {
        _.each(obj.children, function(obj) {
          FN.release(obj);
        });
      }

    },

  defineProperty: function(property) {

      var object = this;
      var secret = '_' + property;
      var flag = '_flag' + property.charAt(0).toUpperCase() + property.slice(1);

      Object.defineProperty(object, property, {
        enumerable: true,
        get: function() {
          return this[secret];
        },
        set: function(v) {
          this[secret] = v;
          this[flag] = true;
        }
      });

    },

    /**
     * Properly defer play calling until after all objects
     * have been updated with their newest styles.
     */
    setPlaying: function(b) {

      this.playing = !!b;
      return this;
    }


      
});

    
export default FN;