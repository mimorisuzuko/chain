import React from 'react';
import cos from '../cosine-curve-points';

const Link = (props) => {
	const { points } = props;

	return (
		<polyline points={cos(...points)} fill='none' stroke='white' strokeWidth={3} />
	);
};

export default Link;