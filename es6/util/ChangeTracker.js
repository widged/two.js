/* jshint esnext: true */

class StateManager {

  constructor() {
    var state =  {
      ks: [],
      vs: [],
      changed: []
    };

    Object.defineProperty(this, 'state',  {
      value: state,
      enumerable: false,
      writable: false,
      configurable: true
    });

  }

  get state() {
    throw "not allowed. Use getState()";
  }

  getState() {
    var {ks, vs, changed} = this.state;
    return ks.reduce((acc, k) => {
      acc[k] = vs[k];
      return acc;
    }, {});
  }

  setOne(k, v) {
    var {ks,vs,changes} = this.state;
    var idx = ks.indexOf(k); if(idx ===-1) { idx = ks.length; ks.push(k); }
    vs[idx] = v;
    if(!changes.includes(k)) { changes.push(k); }
  }
  setState(o) {
    Object.keys(o).forEach((k) => { setOne(k, o[k]); })
  }
}


export default StateManager;
