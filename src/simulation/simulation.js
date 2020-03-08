'use strict';

import Evented from '../components/evented.js';
import Array from '../utils/array.js';


export default class Simulation extends Evented { 
	

	constructor() {
		super();
		
		this.svg = null;
		this.transition = null;
		this.val = null;
		this.ma = null;

		this.name = null;
		this.files = null;
		this.simulator = null;
		
		this.palette = null;
	
	}
	
	Initialize(info) {
		this.simulator = info.simulator;
		this.name = info.name;
		this.files = info.files;
		
	}
	
	
}