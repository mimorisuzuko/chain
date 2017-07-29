import React from 'react';
import _ from 'lodash';

/**
 * @param {{style: Object, value: string, onClick: Function}} props
 */
const BlockButton = (props) => {
	const { style, value, onClick } = props;

	return (
		<button onClick={onClick} style={_.merge({
			display: 'inline-block',
			textDecoration: 'none',
			color: 'inherit',
			border: 'none',
			font: 'inherit',
			padding: '1px 8px',
			outline: 'none',
			cursor: 'pointer'
		}, style)}>
			{value}
		</button>
	);
};

export default BlockButton;