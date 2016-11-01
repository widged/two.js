/* jshint esnext: true */

var shpKeys = [];
shpKeys = shpKeys.concat(["vertices","stroke","linewidth","fill","opacity","cap","join","miter","closed"]);

var rdrKeys = [];
rdrKeys = rdrKeys.concat(["scale","opacity","rect"]);

var FN = {};

FN.getShapeProps = (shape, ks) => {
  var acc = {};
  ks.forEach((k) => {
    var secret = '_' + k;
    if(shape.hasOwnProperty(secret)) {
      acc[k] = shape[secret];
    // } else if(shape.hasOwnProperty(secret)) {
    //   acc[k] = shape[k];
    } else {
      // console.log(`[getShapeProps] key not found: ${k}`);
    }
  });
  return acc;
};

FN.getRendererProps = (shape, ks) => {
      var acc = {};
      var renderer = shape._renderer;
      ks.forEach((k) => {
        if(renderer.hasOwnProperty(k)) {
          acc['rdr_'+k] = renderer[k];
        } else {
          console.log(`[getRendererProps] key not found: ${k}`);
        }
      });
      return acc;
    };
export default FN;
