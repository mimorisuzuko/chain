import React, { Component } from 'react';
import { connect } from 'react-redux';
import Block from '../containers/Block';
import BlockCreator from '../containers/BlockCreator';
import actions from '../actions';
import PointLink from '../components/PointLink';
import PinLink from '../containers/PinLink';
import _ from 'lodash';
import autobind from 'autobind-decorator';
import Pin from '../components/Pin';
import { Pin as PinModel } from '../models';
import { batchActions } from 'redux-batched-actions';
import { getPosition } from '../util';
import './Chain.scss';

@connect(
	(state) => ({
		blocks: state.blocks,
		link: state.pointLink,
		links: state.pinLinks,
		blockCreator: state.blockCreator
	})
)
export default class Chain extends Component {
	componentDidMount() {
		window.addEventListener('message', this.onMessage);
	}

	render() {
		const { props: { link, links, blockCreator } } = this;
		let { props: { blocks } } = this;

		return (
			<div styleName='base'>
				<svg onMouseDown={this.onMouseDownOrTouchStart} onTouchStart={this.onMouseDownOrTouchStart}>
					{links.map((a, i) => {
						_.forEach(['input', 'output'], (key) => {
							const { block, pin } = a.get(key);
							blocks = blocks.setIn([block, `${key}Pins`, pin, 'linked'], true);
						});

						return <PinLink key={i} model={a} />;
					})}
					<PointLink model={link} />
				</svg>
				{blocks.map((model) => {
					const id = model.get('id');
					return [
						<Block key={id} model={model} />,
						model.get('inputPins').map((pin) => <Pin key={pin.get('index')} model={pin} parent={id} onMouseDownOrTouchStart={this.onConnectStart} onMouseUpOrTouchEnd={this.onConnectPin} />),
						model.get('outputPins').map((pin) => <Pin key={pin.get('index')} model={pin} parent={id} onMouseDownOrTouchStart={this.onConnectStart} onMouseUpOrTouchEnd={this.onConnectPin} />)
					];
				})}
				<BlockCreator model={blockCreator} />
			</div>
		);
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 * @param {any} pinModel
	 * @param {number} block
	 */
	@autobind
	onConnectStart(e, pinModel, block) {
		const { props: { dispatch } } = this;
		const pinType = pinModel.get('type');
		const pin = pinModel.get('index');
		const batch = [actions.startPointLink({ x: pinModel.get('cx'), y: pinModel.get('cy') })];

		document.addEventListener('mousemove', this.onConnecting);
		document.addEventListener('mouseup', this.onConnectEnd);
		document.addEventListener('touchmove', this.onConnecting);
		document.addEventListener('touchend', this.onConnectEnd);
		window.__connection__ = { block, pin, pinType };

		if (pinType === PinModel.INPUT) {
			batch.push(actions.removePinLinkByQuery({ input: { block, pin } }));
		}

		dispatch(batchActions(batch));
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onConnecting(e) {
		const { props: { dispatch } } = this;
		const { clientX, clientY } = getPosition(e);

		dispatch(actions.endPointLink({ x: clientX, y: clientY }));
	}

	@autobind
	onConnectEnd() {
		const { props: { dispatch } } = this;

		dispatch(actions.startPointLink({ x: 0, y: 0 }));
		document.removeEventListener('mousemove', this.onConnecting);
		document.removeEventListener('mouseup', this.onConnectEnd);
		document.removeEventListener('touchmove', this.onConnecting);
		document.removeEventListener('touchend', this.onConnectEnd);
	}

	/**
	 * @param {MouseEvent} e
	 * @param {any} pin
	 * @param {number} block1
	 */
	@autobind
	onConnectPin(e, pin, block1) {
		const { __connection__: { block: block0, pin: pin0, pinType: pinType0 } } = window;
		const { props: { dispatch } } = this;
		const pin1 = pin.get('index');
		const pinType1 = pin.get('type');

		if (block0 !== block1 && pinType0 !== pinType1) {
			dispatch(actions.addPinLink({
				[Block.convertPinType(pinType0)]: { block: block0, pin: pin0 },
				[Block.convertPinType(pinType1)]: { block: block1, pin: pin1 }
			}));
		}
	}

	/**
	 * @param {MessageEvent} e 
	 */
	@autobind
	onMessage(e) {
		const { props: { dispatch } } = this;
		const { data: { type, value } } = e;

		if (type === 'chain-result') {
			dispatch(actions.pushViewBlock(JSON.stringify(value)));
		} else if (type === 'chain-error') {
			dispatch(actions.addBalloon({ value }));
		} else if (type === 'chain-clear') {
			dispatch(actions.clearViewBlock());
		}
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	@autobind
	onMouseDownOrTouchStart(e) {
		const { target, currentTarget } = e;
		const { clientX, clientY } = getPosition(e);
		const { props: { dispatch } } = this;

		if (target === currentTarget) {
			dispatch(actions.showBlockCreator({ x: clientX, y: clientY }));
		}
	}
}