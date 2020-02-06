'use strict';

export default class ParsedValues { 

	constructor(frame, model, state, input, output, errorMsg, phase) {

		this.frame = frame;
		this.model = model;
		this.state = state;
		this.input = input;
		this.output = output;
		this.errorMsg = errorMsg;
		this.phase = phase;
	}

	get Frame() {
		return this.frame;
	}

	get Model() {
		return this.model;
	}
	
	get State() {
		return this.state;
	}

	get Input() {
		return this.input;
	}
	
	get Output() {
		return this.output;
	}

	get ErrorMsg() {
		return this.errorMsg;
	}

	get Phase() {
		return this.phase;
	}
}