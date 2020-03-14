'use strict';

import Lang from '../../utils/lang.js';
import Array from '../../utils/array.js';
import Sim from '../../utils/sim.js';
import Parser from "./parser.js";
import TransitionCSV from '../transitionCSV.js';
import ChunkReader from '../../components/chunkReader.js';
import Simulation from '../simulation.js';


export default class DEVS extends Parser { 
		
	constructor(fileList) {
		super(fileList);
		this.svg ;
		this.transitionCSV = [];
	}
		
	IsValid() {		
		var d = Lang.Defer();
		var log = Array.Find(this.files, function(f) { return f.name.match(/.log/i); });
		var ma = Array.Find(this.files, function(f) { return f.name.match(/.ma/i); });
		var svg = Array.Find(this.files, function(f) { return f.name.match(/.svg/i); });
		
		// TODO : This should reject
		if (!log || !ma ) d.Resolve(false);
		
   		var reader = new ChunkReader();
		//if(log && ma)
		reader.ReadChunk(ma, 400).then((ev) => {
			var type = ev.result.match(/type\s*:\s*(.+)/);
			
			d.Resolve(type == null);
		});
  		
		
		return d.promise;
	}
	
	Parse(files) {
		var d = Lang.Defer();
		var simulation = new Simulation();
		

		var log = Array.Find(files, function(f) { return f.name.match(/.log/i); });
		var svg = Array.Find(files, function(f) { return f.name.match(/.svg/i); });

		
		var p1 = Sim.ParseFileByChunk(log, this.ParseLogChunk.bind(this));

		var p2 = Sim.ParseFile(svg, this.ParseSVGFile.bind(this));

		//var p2 = Sim.ParseFile(svg, this.ParseSVGFile.bind(this));


		var defs = [p1, p2];
	
		Promise.all(defs).then((data) => {
			
			var info = {
				simulator : "DEVS",
				simulatorName : log.name.replace(/\.[^.]*$/, ''),
				
			}


			simulation.transition = this.transitionCSV;
			simulation.svg=this.svg;
			simulation.Initialize(info);

			d.Resolve(simulation);

		});

		return d.promise;
	}

	ParseSVGFile( file) 
	{	
		this.svg=file;
		
	}
				

	ParseLogChunk( chunk, progress) {		
		var lines = [];
		var start = chunk.indexOf('Mensaje Y', 0);
		var linesX = [];
		var startX = chunk.indexOf('Mensaje X', 0);

		while (start > -1 && start < chunk.length) {			
			var end = chunk.indexOf('\n', start);
			
			if (end == -1) end = chunk.length + 1;
			
			var length = end - start;
			
			lines.push(chunk.substr(start, length));

			var start = chunk.indexOf('Mensaje Y', start + length);
		}
		while (startX > -1 && startX < chunk.length) {
			var endX = chunk.indexOf('\n', startX);

			if (endX == -1) endX = chunk.length + 1;

			var lengthX = endX - startX;

			linesX.push(chunk.substr(startX, lengthX));

			var startX = chunk.indexOf('Mensaje X', startX + lengthX);
		}

		var safe = [];
		Array.ForEach(linesX, function(line) {
		
		var split = line.split("/");
			
						var frame = split[1].trim();
						
						var model = split[2].substring(0,  split[2].indexOf('(')).trim();

						var stateValue = parseFloat(split[4]);
						
						var input = split[3].trim();

						

					var a = new TransitionCSV(frame, model, stateValue,input, "","","","");
					this.transitionCSV.push(a);
		
		}.bind(this));



		Array.ForEach(lines, function(line) {
			var split = line.split("/");
		
			
					
						var frame = split[1].trim();
						
						
						var model = split[2].substring(0,  split[2].indexOf('(')).trim();

						var stateValue = parseFloat(split[4]);
						
						var output = split[3].trim();


					var a = new TransitionCSV(frame, model, stateValue,"", output,"","","");
					this.transitionCSV.push(a);
		
		}.bind(this));

return this.transitionCSV;
	}
}