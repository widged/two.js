import Cache   from '../../util/Cache';
import Commands from '../../constant/CommandTypes';

// Returns true if this is a non-transforming matrix

var FN = {};

var shapeCache = {};

FN.Commands = Commands;

FN.isHidden = /(none|transparent)/i;

FN.alignments = {
    left: 'start',
    middle: 'center',
    right: 'end'
};

FN.shim = function(elem) {
  elem.tagName = 'FN';
  elem.nodeType = 1;
  return elem;
}

FN.isDefaultMatrix = (m) => {
  return (m[0] == 1 && m[3] == 0 && m[1] == 0 && m[4] == 1 && m[2] == 0 && m[5] == 0);
};

var shapeCache = new Cache((key) => { return require('./' + key).default; });

FN.renderShape = (elm, ctx, condi, clip) => {
	var type = elm._renderer.type;
	shapeCache.get(type).call(elm, ctx, condi, clip);
};


export default FN;

/*
function resetTransform(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
*/