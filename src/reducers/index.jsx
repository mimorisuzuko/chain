import { combineReducers } from 'redux';
import blocks from './blocks';
import blockCreator from './block-creator';

export default combineReducers({ blocks, blockCreator });