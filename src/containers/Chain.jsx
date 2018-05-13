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
import { PIN } from '../constants';
import { batchActions } from 'redux-batched-actions';
import { getMouseOrFirstTouchPosition } from '../util';
import { toast } from 'react-toastify';
import './Chain.scss';

window.ontouchmove = () => { };

@connect(
	({ blocks, pointLink, pinLinks, blockCreator }) => ({
		blocks,
		link: pointLink,
		links: pinLinks,
		blockCreator
	})
)
export default class Chain extends Component {
	/**
	 * @param {string} type
	 */
	static convertPinTypeToPinLinkKey(type) {
		switch (type) {
			case PIN.TYPE_OUTPUT:
				return 'output';
			case PIN.TYPE_INPUT:
				return 'input';
			default:
				throw new Error('Unknown pin type');
		}
	}

	componentDidMount() {
		window.addEventListener('message', this.onMessage);
	}

	componentWillReceiveProps(nextProps) {
		const { blocks, links } = nextProps;

		localStorage.setItem('storedState', JSON.stringify({
			blocks: blocks.toJS(),
			links: links.toJS()
		}));
	}

	componentWillUnmount() {
		window.removeEventListener('message', this.onMessage);
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

		if (pinType === PIN.TYPE_INPUT) {
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
		const { clientX, clientY } = getMouseOrFirstTouchPosition(e);

		e.preventDefault();
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
				[Chain.convertPinTypeToPinLinkKey(pinType0)]: { block: block0, pin: pin0 },
				[Chain.convertPinTypeToPinLinkKey(pinType1)]: { block: block1, pin: pin1 }
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
			toast.error(value, {
				position: toast.POSITION.BOTTOM_RIGHT
			});
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
		const { clientX, clientY } = getMouseOrFirstTouchPosition(e);
		const { props: { dispatch } } = this;

		if (target === currentTarget) {
			dispatch(actions.showBlockCreator({ x: clientX, y: clientY }));
		}
	}

	render() {
		const { props: { link, links, blockCreator } } = this;
		let { props: { blocks } } = this;

		return (
			<div styleName='base'>
				<svg onMouseDown={this.onMouseDownOrTouchStart} onTouchStart={this.onMouseDownOrTouchStart}>
					{links.map((a, i) => {
						_.forEach(['input', 'output'], (key) => {
							const index = blocks.findIndex((block) => block.get('id') === a.getIn([key, 'block']));

							blocks = blocks.setIn([index, `${key}Pins`, a.getIn([key, 'pin']), 'linked'], true);
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
}
