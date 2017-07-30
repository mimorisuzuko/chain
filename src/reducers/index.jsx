import { combineReducers } from 'redux';
import blocks from './blocks';
import blockCreator from './block-creator';
import pointLink from './point-link';
import pinLinks from './pin-links';

export default combineReducers({ blocks, blockCreator, pointLink, pinLinks });