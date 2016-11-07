/* jshint esnext: true */

class Cache {

  constructor(keyLoader) {
    this.keyLoader = keyLoader;
    this.cached = {};
  }
  get(key) {
    let {cached, keyLoader} = this;
    if(!cached.hasOwnProperty(key)) {
      var m = keyLoader(key);
      cached[key] = m;
    }
    return cached[key];
  }
}

export default Cache;
