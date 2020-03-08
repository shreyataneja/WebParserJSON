'use strict';
import Sim from '../utils/sim.js';
import Lang from '../utils/lang.js';
import Array from '../utils/array.js';
import Widget from '../ui/widget.js';
import Dropzone from './dropzone.js';
import Net from '../utils/net.js';

export default Lang.Templatable("Widget.Control", class Control extends Widget { 

	
	get Config() { return this.config; }
	
	constructor(node) {		
		super(node);
		
		this.files = null;
		this.config = null;
		this.parser = null;
		this.collapsed = false;
		this.csv= "";
		
		this.Node("dbSave").addEventListener("click", this.onLoadClick_Handler.bind(this));
		this.Node("dropzone").On("Change", this.onDropzoneChange_Handler.bind(this));
		
		
	}

	DownloadCSV(simulation)
	{
		var myJSON = JSON.stringify(simulation);
		console.log(myJSON);
		 var array = typeof myJSON != 'object' ? JSON.parse(myJSON) : myJSON;
            
  			var keys = [];
   			for(var index in array[0]) keys.push(index);
   				var CSVstring = keys.join();
   			CSVstring +=   '\r\n';
            for (var i = 0; i < array.length; i++) {
                var line = '';
                for (var index in array[i]) {
                    if (line != '') line += ','
 
                    line += array[i][index];

                }
 
                CSVstring += line + '\r\n';
            }
        this.fileName = simulation.name;
		
	//	Net.Download(this.fileName + ".csv", CSVstring);
	}

	onLoadClick_Handler(ev) {
		
		this.parser.Parse(this.files).then((ev) => { this.DownloadCSV(ev.result); });
		
		this.Emit("Save");	
	}

	onDropzoneChange_Handler(ev) {
		this.files = ev.files;

		var success = this.onParserDetected_Handler.bind(this);
		var failure = this.onError_Handler.bind(this);
		
		Sim.DetectParser(ev.files).then(success, failure);	
		
	}
	

	onConfigParsed_Handler(ev) {
		this.config = ev.result;
	
	}	
	
	onParserDetected_Handler(ev) {
		this.parser = ev.result;
	//	console.log(this.parser);
		var json = Array.Find(this.files, function(f) { return f.name.match(/.json/i); });
		
		var success = this.onConfigParsed_Handler.bind(this);
		var failure = this.onError_Handler.bind(this);
		
		Sim.ParseFile(json, (d) => { return JSON.parse(d); }).then(success, failure);
		
	}
	
	
	onError_Handler(ev) {
		// TODO : Probably handle error here, alert message or something.
		this.Node("dropzone").Reset();
		
		alert(ev.error.toString());
	}
	



	Template() {
		return "<div class='control row'>" +
				  "<div class='file-upload'>" +
				   
					 
						 "<div handle='dropzone' class='dropzone' widget='Widget.Dropzone'></div>" +
						 "<button handle='dbSave' class='file-save-btn' >Parse files</button>" +
						  "</div>" +
					  
					  "<div >" ;
	}
});