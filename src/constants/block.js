import _ from 'lodash';
import vars from '../shared/vars.scss';

const { blockWidth: strblockWidth } = vars;
export const WIDTH = _.parseInt(strblockWidth);
export const TYPE_VALUE = 'VALUE_BLOCK';
export const TYPE_FUNCTION = 'FUNCTION_BLOCK';
export const TYPE_PROPERTY = 'PROPERTY_BLOCK';
export const TYPE_OPERATOR = 'OPERATOR_BLCOK';
export const TYPE_VIEW = 'VIEW_BLOCK';
