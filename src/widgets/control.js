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
		this.simulationJSON.style = simulation.palette;
	

		// // basic auth

		var gh = new GitHub({
		   username: 'shreyataneja',
		   password: 'kriti98825'
		   /* also acceptable:
		      token: 'MY_OAUTH_TOKEN'
		    */
		});

		if(simulation.svg != null)
		{
		var gist_var_svg = {
		   public: true,
		   description: 'SVG gist',
		   files: {
		      "SVGfile.svg": {
		         content: String(simulation.svg)
		      }
		   }
		};
		let gist_svg = gh.getGist(); // not a gist yet
		gist_svg.create(gist_var_svg).then(function({data}) {
		this.setSVGURL(data.url);
		}.bind(this));

 		}
		var gist_var_csv = {
		   public: true,
		   description: 'CSV gist',
		   files: {
		      "CSVfile.csv": {
		         content: String(CSVstring)
		      }
		   }
		};
		
		let gist = gh.getGist(); // not a gist yet
		gist.create(gist_var_csv).then(function({data}) {
		 this.setCSVURL(data.url);
		}.bind(this));

	}

setCSVURL(url)
{
	
	 this.simulationJSON.log = url;
		this.Download();
}
setSVGURL(url)
{
	
	this.simulationJSON.svg = url;
	
}
Download()
{

		
		var styleJson = [];
		if(this.simulationJSON.style)
		for( var i = 0 ; i < this.simulationJSON.style.length ; i++)
		{
			console.log(this.simulationJSON.style[i][0]);
	
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