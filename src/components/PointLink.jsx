import React from 'react';
import Link from './Link';

const Point = (props) => {
	const { model } = props;

	return (
		<Link points={model.points()} />
	);
};

export default Point;