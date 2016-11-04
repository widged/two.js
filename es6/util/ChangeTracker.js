/* jshint esnext: true */

class ChangeTracker {
  constructor(raised) {
    this.state = {flat : raised};
  }


  listChanges() { return this.state.flat; }
  raise(keys) {
    var {flat} = this.state;
    keys.forEach((k) => {
      if(!flat.includes(k)) { flat.push(k); }
    });
  }

  drop(keys) {
    var {flat} = this.state;
    keys.forEach((k) => {
      var idx = flat.indexOf(k);
      if(idx !== -1) { flat.splice(idx, 1); }
    });
  }

  oneChange(k) {
    var {flat} = this.state;
    return flat.includes(k);
  }
  anyChange(keys) {
    var {flat} = this.state;
    return keys.filter((k) => {
      return flat.includes(k);
    }).length ? true : false;
  }
}

export default ChangeTracker;
