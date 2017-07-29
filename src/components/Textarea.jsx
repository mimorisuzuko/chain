import React from 'react';
import { lblack } from '../color';
import merge from 'lodash.merge';

/**
 * @param {{readOnly: boolean, onChange: Function, value: string, style: Object}} props 
 */
const Textarea = (props) => {
	const { readOnly, onChange, value, style } = merge({
		readonly: false,
		style: {
			display: 'block',
			font: 'inherit',
			color: 'inherit',
			backgroundColor: lblack,
			border: 'none',
			outline: 'none',
			width: '100%',
			boxSizing: 'border-box',
			padding: '2px 8px'
		}
	}, props);

	return (
		<textarea readOnly={readOnly} onChange={onChange} value={value} style={style} />
	);
};

export default Textarea;