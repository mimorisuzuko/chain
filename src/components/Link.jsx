import React from 'react';
import { cosineCurvePoints } from '../util';
import vars from '../shared/vars.scss';

const { white0 } = vars;

const Link = (props) => {
	const { points, strokeDasharray } = props;

	return (
		<polyline points={cosineCurvePoints(...points)} fill='none' stroke={white0} strokeWidth={3} strokeDasharray={strokeDasharray} />
	);
};

export default Link;
