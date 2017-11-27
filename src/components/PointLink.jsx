import React from 'react';
import Link from './Link';

const PointLink = (props) => {
	const { model } = props;

	return (
		<Link points={model.points()} strokeDasharray={[5, 5]} />
	);
};

export default PointLink;
