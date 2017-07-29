import React from 'react';
import { lblack } from '../color';
import _ from 'lodash';
import Radium from 'radium';

/**
 * @param {{readOnly: boolean, onChange: Function, value: string, style: Object}} props 
 */
const Textarea = (props) => {
	const { readOnly, onChange, value, style } = _.merge({
		readonly: false,
		style: {
			display: 'block',
			color: 'inherit',
			backgroundColor: lblack,
			outline: 'none',
			width: '100%',
			boxSizing: 'border-box',
			padding: '2px 7px'
		}
	}, props);

	return (
		<textarea readOnly={readOnly} onChange={onChange} value={value} style={style} spellCheck={false}/>
	);
};

export default Radium(Textarea);