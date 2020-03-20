'use strict';
import Sim from '../utils/sim.js';
import Lang from '../utils/lang.js';
import Array from '../utils/array.js';
import Widget from '../ui/widget.js';
import Dropzone from './dropzone.js';
import SimulationJSON from './simulationJSON.js';
import Net from '../utils/net.js';

export default Lang.Templatable("Widget.Control", class Control extends Widget { 

	
	get Config() { return this.config; }
	
	constructor(node) {		
		super(node);
		
		this.files = null;
		this.config = null;
		this.parser = null;
		this.simulationJSON = new SimulationJSON();

		this.Node("dbSave").addEventListener("click", this.onLoadClick_Handler.bind(this));
		this.Node("dropzone").On("Change", this.onDropzoneChange_Handler.bind(this));
		
		
	}

	DownloadJOSN(simulation)
	{	
		var myJSON = JSON.stringify(simulation.transition);
		
		 var array = typeof myJSON != 'object' ? JSON.parse(myJSON) : myJSON;
     
   			var CSVstring = '';
   			
            for (var i = 0; i < array.length-1; i++) {
                var line = '';
                for (var index in array[i]) {

                    if (line != '') line += ','
 
                    line += array[i][index];

                }
 
                CSVstring += line + '\r\n';
            }
//for last line

              var line = '';
                for (var index in array[i]) {

                    if (line != '') line += ','
 
                    line += array[i][index];

                }
 
                CSVstring += line;


		this.simulationJSON.size = simulation.size;
		this.simulationJSON.modelName = simulation.simulatorName;
		this.simulationJSON.simulator = simulation.simulator;
		this.simulationJSON.style = simulation.palette ;
	
		if(simulation.svg)
		var p1 = Net.CreateGistSVG(String(simulation.svg));
		var p2 = Net.CreateGistCSV(String(CSVstring));
		Promise.all([p1,p2]).then((data) => {
			
			this.setCSVURL (data[0], data[1]) ;
		});	
		
			
	}

setCSVURL(SVGurl, CSVurl)
{
	this.simulationJSON.svg = SVGurl;
	this.simulationJSON.log = CSVurl;
	this.Download();

}

Download()
{

		
		var styleJson = [];
		if(this.simulationJSON.style)
		for( var i = 0 ; i < this.simulationJSON.style.length ; i++)
		{
	
	
   				var rangeValue = [this.simulationJSON.style[i][0],this.simulationJSON.style[i][1]];

  				var colorValue = this.simulationJSON.style[i][2];
  		
			styleJson.push({range : rangeValue,color : colorValue});
		}

		var simJSON = JSON.stringify({ 
			files : {
				svg : this.simulationJSON.svg,
				log : this.simulationJSON.log
			},
			simulator : this.simulationJSON.simulator, 
			model : {
				name : this.simulationJSON.modelName,
				size : this.simulationJSON.size 
			}
			,
			style : styleJson
				
			
		});;
	
	Net.Download(this.simulationJSON.modelName + ".json", simJSON);

}
	onLoadClick_Handler(ev) {
		
		this.parser.Parse(this.files).then((ev) => { this.DownloadJOSN(ev.result); });
		
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
	
		this.onConfigParsed_Handler(ev);
	}
	
	
	onError_Handler(ev) {

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