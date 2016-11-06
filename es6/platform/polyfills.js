/* jshint esnext: true */

// indexOf polyfill
if (!!Array.indexOf) {
  Array.prototype.indexOf = function(list, item) {
    for (var i = 0; i < list.length; i++) {
      if (list[i] === item) {
        return i;
      }
    }
    return -1;
  };
}
