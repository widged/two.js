/* jshint esnext: true */

// :NOTE: temporary, to make it less cumbersome to move files around

import is  from '../util/is';
import common  from '../util/common';
import UidGenerator  from '../util/uid-generator';
import ChangeTracker  from '../util/ChangeTracker';

import Commands  from '../constant/CommandTypes';
import DefaultValues from '../constant/DefaultValues';

import Anchor   from './Anchor';
import VectorEventTypes   from '../constant/VectorEventTypes';
import Vector   from '../struct/Vector';
import Matrix   from '../struct/Matrix';

import CollectionEventTypes   from '../constant/CollectionEventTypes';
import Collection  from '../struct/Collection';

import shapeRendering   from '../renderer-lib/renderer-bridge';

import exportFN  from './fn-export';
import rectFN  from './fn-rect';
import pathFN  from './fn-path';


export default {
  is, common, UidGenerator, ChangeTracker,
  Commands, DefaultValues,
  Anchor, Vector, VectorEventTypes, Matrix,
  Collection, CollectionEventTypes,
  shapeRendering,
  exportFN, rectFN, pathFN
};
