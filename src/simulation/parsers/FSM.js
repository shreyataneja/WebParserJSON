'use strict';

import Lang from '../../utils/lang.js';
import Array from '../../utils/array.js';
import Sim from '../../utils/sim.js';
import TransitionCSV from '../transitionCSV.js';
import Parser from "./parser.js";
import ChunkReader from '../../components/chunkReader.js';

export default class FSM extends Parser { 
		
	constructor(fileList) {
		super(fileList); 
		
		this.transitionCSV = [];
	}
		
	IsValid() {		
		var d = Lang.Defer();
		var txt = Array.Find(this.files, function(f) { return f.name.match(/.txt/i); });
		//var svg = Array.Find(this.files, function(f) { return f.name.match(/.svg/i); });
		
		if (!txt) d.Resolve(false);
		
   		var reader = new ChunkReader();

		reader.ReadChunk(txt, 400).then((ev) => {
			var type = ev.result.match(/type\s*:\s*(.+)/);
			
			d.Resolve(type == null);
		});
  		
		return d.promise;
	}
	
	Parse(files) {
		
		var txt = Array.Find(files, function(f) { return f.name.match(/.txt/i); });
	
		var p1 = Sim.ParseFile(txt, this.ParseTxtFile.bind(this));


		var defs = [p1];
	
		Promise.all(defs).then((data) => {
			
			var info = {
				simulator : "FSM",
				name : txt.name.replace(/\.[^.]*$/, ''),
				files : files,
			
			}

		});

	
		return p1;
	}

	
	ParseTxtFile( chunk, progress) {		
		var lines = [];
		var linesState =[];
		 var start = chunk.indexOf('00', 0);

		while (start > -1 && start < chunk.length) {			
			var end = chunk.indexOf('\n', start);
			
			if (end == -1) end = chunk.length + 1;
			
			var length = end - start;
			
			lines.push(chunk.substr(start, length));

			var start = chunk.indexOf('00', start + length);
		}
		linesState = (chunk.split("\n"));
		
		var i=0;
		var j=0;
		while(i<linesState.length)
		{
			if(linesState[i].startsWith('00'))
				
				{
					
					j=i+1;

					while(j<linesState.length)
				{
					if(linesState[j].startsWith('State'))
				
				{	
					if(linesState[j].includes('input_reader'))
					{		j++;
							
					}

					else
					{
						var frame = linesState[i];
						var arr= linesState[j].split("&");
						var modelState = arr[0].split(" ");
						var model = modelState[modelState.indexOf("model")+1];

						var stateValue = modelState[modelState.indexOf("State:")+1];
						

						var o = arr[1].split(":");
						var output = o[1].trim();

						var e = arr[2].split(":");
						var error = e[1].trim();

						var p = arr[3].split(":");
						var phase = p[1].trim();

						var input = "";

					var a = new TransitionCSV(frame, model, stateValue,input, output,error,phase);
					this.transitionCSV.push(a);

					j++;
					}
				}

				else
					{		j++;
							break;
					}
				}
			}
				

			i++;
		}
	
		return this.transitionCSV;
	}
}