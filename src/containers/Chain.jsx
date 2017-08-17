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
import { getMouseOrFirstTouchPosition } from '../util';
import jsonpatch from 'fast-json-patch';
import socket from '../socket';
import './Chain.scss';

window.ontouchmove = () => { };

@connect(
	(state) => ({
		blocks: state.blocks,
		link: state.pointLink,
		links: state.pinLinks,
		blockCreator: state.blockCreator
	})
)
export default class Chain extends Component {
	constructor() {
		super();

		this.skipSendingPatch = false;
		socket.on('state', this.onStateBySocket);
	}

	componentWillReceiveProps(nextProps) {
		const { props: { blocks, links }, skipSendingPatch } = this;
		const { blocks: nextBlocks, links: nextLinks } = nextProps;
		const blocksPatches = jsonpatch.compare(blocks.toJS(), nextBlocks.toJS());
		const linksPatches = jsonpatch.compare(links.toJS(), nextLinks.toJS());

		if (!skipSendingPatch) {
			if (blocksPatches.length + linksPatches.length > 0) {
				socket.emit('patch', {
					blocks: blocksPatches,
					links: linksPatches
				});
			}
		}

		this.skipSendingPatch = false;
	}

	componentDidMount() {
		window.addEventListener('message', this.onMessage);
	}

	componentWillUnmount() {
		window.removeEventListener('message', this.onMessage);
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
		const { clientX, clientY } = getMouseOrFirstTouchPosition(e);
		const { props: { dispatch } } = this;

		if (target === currentTarget) {
			dispatch(actions.showBlockCreator({ x: clientX, y: clientY }));
		}
	}

	@autobind
	onStateBySocket({ blocks: nextBlocks, links: nextLinks }) {
		const { props: { blocks, links, dispatch } } = this;
		const batch = [];

		_.forEach(jsonpatch.compare(blocks.toJS(), nextBlocks), ({ op, path: strpath, value }) => {
			const path = _.split(strpath.substring(1), '/');
			const { length } = path;

			if (length > 0) {
				path[0] = _.parseInt(path[0]);
			}

			if (length > 2) {
				path[2] = _.parseInt(path[2]);
			}

			if (op === 'add') {
				if (length === 1) {
					batch.push(actions.addBlock(value));
				} else if (length === 3) {
					batch.push(actions.cochainSetInBlock(path, new PinModel(value)));
				}
			}

			if (op === 'replace') {
				if (length === 2) {
					const { id } = nextBlocks[path[0]];
					const key = path[1];
					if (id !== 0 || key !== 'value') {
						batch.push(actions.updateBlock(id, { [key]: value }));
					}
				} else if (length === 4) {
					batch.push(actions.cochainSetInBlock({ path, value }));
				}
			}

			if (op === 'remove') {
				if (length === 3) {
					const id = blocks.getIn([path[0], 'id']);
					batch.push(actions.deletePin(id));
				}

				if (length === 1) {
					const id = blocks.getIn([path[0], 'id']);
					batch.push(actions.deleteBlock(id));
				}
			}
		});

		_.forEach(jsonpatch.compare(links.toJS(), nextLinks), ({ op, path: strpath, value }) => {
			const path = _.split(strpath.substring(1), '/');
			const { length } = path;

			if (length > 0) {
				path[0] = _.parseInt(path[0]);
			}

			if (op === 'add' && value !== null) {
				batch.push(actions.addPinLink(value));
			}

			if (op === 'remove') {
				if (length === 1) {
					batch.push(actions.cochainRemovePinLink(path[0]));
				}
			}

			if (op === 'replace') {
				if (length === 3) {
					batch.push(actions.cochainSetInPinLink({ path, value }));
				}
			}
		});

		if (batch.length > 0) {
			this.skipSendingPatch = true;
			dispatch(batchActions(batch));
		}
	}
}