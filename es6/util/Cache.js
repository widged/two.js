class Cache {
  constructor(loadOnce) {
    this.loadOnce = loadOnce;
    this.cached = {};
  }
  get(key) {
    var {cached, loadOnce} = this;
    if(!cached.hasOwnProperty(key)) {
      var m = loadOnce(key);
      cached[key] = m;
    }
    return cached[key];
  }
}

export default Cache;