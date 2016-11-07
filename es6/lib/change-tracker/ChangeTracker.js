/* jshint esnext: true */

class ChangeTracker {
  constructor() {
    this.state = {flat : []};
  }

  listChanges() { return this.state.flat; }
  raise(keys) {
    let {flat} = this.state;
    let i = keys.length, k = null;
    while (i--) {
      k = keys[i];
      if(!flat.includes(k)) { flat.push(k); }
    }
  }

  drop(keys) {
    let {flat} = this.state;
    let i = keys.length, k = null, idx = null;
    while (i--) {
      k = keys[i];
      idx = flat.indexOf(k);
      if(idx !== -1) { flat.splice(idx, 1); }
    }
  }

  oneChange(k) {
    let {flat} = this.state;
    return flat.includes(k);
  }

  anyChange(keys) {
    let {flat} = this.state;
    let acc = false;
    if(!keys || !keys.length) { return acc;}
    let i = keys.length, k = null;
    while (i-- && !acc) {
      if(flat.includes(keys[i])) { acc = true; }
    }
    return acc;
  }
}

export default ChangeTracker;
