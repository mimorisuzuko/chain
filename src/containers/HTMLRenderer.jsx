import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { BlockCreator as BlockCreatorModel } from '../models';

export default connect(
	(state) => ({
		blocks: state.blocks,
		links: state.pinLinks
	})
)(class HTMLRenderer extends Component {
	render() {
		return (
			<div style={{ position: 'fixed', right: 10, top: 10, backgroundColor: 'white' }}>
				{this.toEvalableString()}
			</div>
		);
	}

	toEvalableString() {
		const { props: { blocks } } = this;

		return this.toEvalableStringSub(blocks.first().get('id'));
	}

	toEvalableStringSub(id) {
		if (id === null) {
			return 'null';
		}

		const { props: { blocks } } = this;
		const block = blocks.get(id);
		const args = block.get('inputPins').map((pin) => this.toEvalableStringSub(this.findOutputBlockIdFromLinks({ input: { block: id, pin: pin.get('id') } }))).toJS();

		switch (block.get('type')) {
			case BlockCreatorModel.VIEW_BLOCK:
				return _.join(args, '\n');
			case BlockCreatorModel.CREATABLE_TYPES.VALUE_BLOCK:
				return block.get('value');
			case BlockCreatorModel.CREATABLE_TYPES.FUNCTION_BLOCK:
				const [head, ...rest] = args;
				const vals = `(${_.join(rest, ', ')})`;
				return head ? `${head}[${JSON.stringify(block.get('value'))}]${vals}` : `${block.get('value')}${vals}`;
			case BlockCreatorModel.CREATABLE_TYPES.PROPERTY_BLOCK:
				return `${args[0]}[${JSON.stringify(block.get('value'))}]`;
			case BlockCreatorModel.CREATABLE_TYPES.OPERATOR_BLCOK:
				return `${args[0]}${block.get('value')}${args[1]}`;
			default:
				return '"UNKNOWN_BLOCK"';
		}
	}

	findOutputBlockIdFromLinks(query) {
		const { props: { links } } = this;
		let block = null;

		links.some((link) => {
			if (link.match(query)) {
				block = link.get('output').block;
				return true;
			}

			return false;
		});

		return block;
	}
});