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
		
		this.Node("control").On("Ready", this.onControlReady_Handler.bind(this));
		this.Node("control").On("Save", this.onControlSave_Handler.bind(this));
		
	
	}
	
	onControlReady_Handler(ev) {
		//if (ev.config) this.session.Load(ev.config);
		
	}

	onError_Handler(ev) {
		alert(ev.error.ToString())
	}
	
	onControlSave_Handler(ev) {
		//this.target = ev.target.parser;
		//this.fileName = this.target.files[0].name.split(".");
		//console.log(ev.target.parser);


		//var myJSON = JSON.stringify(this.target.parsedValues);
		 //var array = typeof myJSON != 'object' ? JSON.parse(myJSON) : myJSON;
           // var str = '';
 
            //for (var i = 0; i < array.length; i++) {
              //  var line = '';
                //for (var index in array[i]) {
                  //  if (line != '') line += ','
 
                    //line += array[i][index];
                //}
 
                //str += line + '\r\n';
            //}
 
		//console.log(myJSON);

	//	Net.Download("this.fileName[0]" + ".csv", this.Save());
	
	}

	
	Template() {
		return	"<div class='main'>" +
					"<div id='header' class='header-row' widget='Widget.Header'></div>" +
					"<div handle='control' class='control row' widget='Widget.Control'></div>" +
					
				"</div>";
	}
}