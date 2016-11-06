/* jshint esnext: true */

// :NOTE: temporary, to make it less cumbersome to move files around
// :NOTE: import cannot be imported in any of these files. Otherwise, it causes circular dependencies.

import is  from '../lib/is/is';
import common  from '../lib-common/common';
import UidGenerator  from '../lib/uid-generator/UidGenerator';
import ChangeTracker  from '../lib/change-tracker/ChangeTracker';

import Commands  from '../lib/struct-anchor/CommandTypes';
import DefaultValues from './DefaultValues';

import Anchor   from '../lib/struct-anchor/Anchor';
import VectorEventTypes   from '../lib/struct-vector/VectorEventTypes';
import Vector   from '../lib/struct-vector/Vector';
import Matrix   from '../lib/struct-matrix/Matrix';

import CollectionEventTypes   from '../lib/struct-collection/CollectionEventTypes';
import Collection  from '../lib/struct-collection/Collection';

import shapeRendering   from '../renderer/renderer-bridge';

import exportFN  from './fn-export';
import rectFN  from './fn-rect';
import pathFN  from './fn-path';
import groupFN  from './fn-group';


export default {
  is, common, UidGenerator, ChangeTracker,
  Commands, DefaultValues,
  Anchor, Vector, VectorEventTypes, Matrix,
  Collection, CollectionEventTypes,
  shapeRendering,
  exportFN, rectFN, pathFN, groupFN
};
