'use strict';

export default class TransitionCSV { 

	constructor(frame, model, stateValue, input, output, errorMsg, phase) {

		this.frame = frame;
		this.model = model;
		this.stateValue = stateValue;
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
	
	get StateValue() {
		return this.stateValue;
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
