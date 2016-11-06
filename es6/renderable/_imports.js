/* jshint esnext: true */

// :NOTE: temporary, to make it less cumbersome to move files around
// :NOTE: import cannot be imported in any of these files. Otherwise, it causes circular dependencies.

import is  from '../lib/is/is';
import common  from '../TwoUtil';
import UidGenerator  from '../lib/uid-generator/UidGenerator';
import ChangeTracker  from '../lib/change-tracker/ChangeTracker';

import Commands  from '../lib/struct-anchor/CommandTypes';
import RenderableDefaults from './RenderableDefaults';

import Anchor   from '../lib/struct-anchor/Anchor';
import anchorFN   from '../lib/struct-anchor/anchor-fn';
import VectorEventTypes   from '../lib/struct-vector/VectorEventTypes';
import Vector   from '../lib/struct-vector/Vector';
import Matrix   from '../lib/struct-matrix/Matrix';
import matrixFN  from '../lib/struct-matrix/matrix-fn';
import rectFN  from '../lib/struct-bounding-rect/bounding-rect-fn';

import CollectionEventTypes   from '../lib/struct-collection/CollectionEventTypes';
// import Collection  from '../lib/struct-collection/Collection';
import Collection  from '../lib/struct-collection/CollectionNonArray';

import rendererBridge   from '../renderer/renderer-bridge';

import exportFN  from './fn-export';
import curveFN  from './shape/fn-curved-path';
import groupFN  from './fn-group';


export default {
  is, common, UidGenerator, ChangeTracker,
  Commands, RenderableDefaults,
  Anchor, anchorFN,
  Vector, VectorEventTypes,
  Matrix, matrixFN,
  Collection, CollectionEventTypes,
  rendererBridge,
  exportFN, rectFN, curveFN, groupFN
};
