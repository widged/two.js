var Manager = function() {

  var count = 0;

  return () => {
    var id = count;
    count++;
    return id;
  }

}

export default Manager;