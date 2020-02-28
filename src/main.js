'use strict';

import nls from './nls.js';
import Lang from './utils/lang.js';
import Net from './utils/net.js';
import Array from './utils/array.js';
import Widget from './ui/widget.js';
import Header from './widgets/header.js';
import Control from './widgets/control.js';	

export default class Main extends Widget { 

	constructor(node) {		
		Lang.locale = "en";
		Lang.nls = nls;
		
		super(node);
		
		
		this.Node("control").On("Save", this.onControlSave_Handler.bind(this));
		
	
	}


	onError_Handler(ev) {
		alert(ev.error.ToString())
	}
	
	onControlSave_Handler(ev) {

	
	}

	
	Template() {
		return	"<div class='main'>" +
					"<div id='header' class='header-row' widget='Widget.Header'></div>" +
					"<div handle='control' class='control row' widget='Widget.Control'></div>" +
					
				"</div>";
	}
}