export default function() {
  var count = -1;
  return () => {
    count += 1;
    return count;
  }
};