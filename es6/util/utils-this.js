

var UtilsThis = {


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
    },


    /**
     * Walk through item properties and pick the ones of interest.
     * Will try to resolve styles applied via CSS
     *
     * TODO: Reverse calculate `Gradient`s for fill / stroke
     * of any given path.
     */
    applySvgAttributes: function(node, elem) {

      var attributes = {}, styles = {}, i, key, value, attr;

      // Not available in non browser environments
      if (getComputedStyle) {
        // Convert CSSStyleDeclaration to a normal object
        var computedStyles = getComputedStyle(node);
        i = computedStyles.length;

        while (i--) {
          key = computedStyles[i];
          value = computedStyles[key];
          // Gecko returns undefined for unset properties
          // Webkit returns the default value
          if (value !== undefined) {
            styles[key] = value;
          }
        }
      }

      // Convert NodeMap to a normal object
      i = node.attributes.length;
      while (i--) {
        attr = node.attributes[i];
        attributes[attr.nodeName] = attr.value;
      }

      // Getting the correct opacity is a bit tricky, since SVG path elements don't
      // support opacity as an attribute, but you can apply it via CSS.
      // So we take the opacity and set (stroke/fill)-opacity to the same value.
      if (!_.isUndefined(styles.opacity)) {
        styles['stroke-opacity'] = styles.opacity;
        styles['fill-opacity'] = styles.opacity;
      }

      // Merge attributes and applied styles (attributes take precedence)
      _.extend(styles, attributes);

      // Similarly visibility is influenced by the value of both display and visibility.
      // Calculate a unified value here which defaults to `true`.
      styles.visible = !(_.isUndefined(styles.display) && styles.display === 'none')
        || (_.isUndefined(styles.visibility) && styles.visibility === 'hidden');

      // Now iterate the whole thing
      for (key in styles) {
        value = styles[key];

        switch (key) {
          case 'transform':
            // TODO: Check this out https://github.com/paperjs/paper.js/blob/master/src/svg/SVGImport.js#L313
            if (value === 'none') break;
            var m = node.getCTM();

            // Might happen when transform string is empty or not valid.
            if (m === null) break;

            // // Option 1: edit the underlying matrix and don't force an auto calc.
            // var m = node.getCTM();
            // elem._matrix.manual = true;
            // elem._matrix.set(m.a, m.b, m.c, m.d, m.e, m.f);

            // Option 2: Decompose and infer Two.js related properties.
            var transforms = Utils.decomposeMatrix(node.getCTM());

            elem.translation.set(transforms.translateX, transforms.translateY);
            elem.rotation = transforms.rotation;
            // Warning: Two.js elements only support uniform scalars...
            elem.scale = transforms.scaleX;

            // Override based on attributes.
            if (styles.x) {
              elem.translation.x = styles.x;
            }

            if (styles.y) {
              elem.translation.y = styles.y;
            }

            break;
          case 'visible':
            elem.visible = value;
            break;
          case 'stroke-linecap':
            elem.cap = value;
            break;
          case 'stroke-linejoin':
            elem.join = value;
            break;
          case 'stroke-miterlimit':
            elem.miter = value;
            break;
          case 'stroke-width':
            elem.linewidth = parseFloat(value);
            break;
          case 'stroke-opacity':
          case 'fill-opacity':
          case 'opacity':
            elem.opacity = parseFloat(value);
            break;
          case 'fill':
          case 'stroke':
            if (/url\(\#.*\)/i.test(value)) {
              elem[key] = this.getById(
                value.replace(/url\(\#(.*)\)/i, '$1'));
            } else {
              elem[key] = (value === 'none') ? 'transparent' : value;
            }
            break;
          case 'id':
            elem.id = value;
            break;
          case 'class':
            elem.classList = value.split(' ');
            break;
        }
      }

      return elem;

    }

  };
 
    
export default UtilsThis;