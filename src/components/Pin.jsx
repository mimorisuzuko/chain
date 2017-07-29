import React from 'react';

export const RADIUS = 7;
const S_RADIUS = 5;

const Pin = (props) => {
	const { cx, cy, color } = props;
	const d = RADIUS + 1;

	return (
		<svg style={{
			position: 'absolute',
			left: cx - d,
			top: cy - d,
			width: RADIUS * 2 + 2,
			height: RADIUS * 2 + 2
		}}>
			<circle cx={d} cy={d} r={S_RADIUS} fill={color} />
			<circle cx={d} cy={d} r={RADIUS} fill={'none'} stroke={color} />
		</svg>
	);
};

export default Pin;