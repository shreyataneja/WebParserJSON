'use strict';

import Lang from '../../utils/lang.js';
import Array from '../../utils/array.js';
import Sim from '../../utils/sim.js';
import Transition from '../transition.js';
import ParsedValues from '../parsedValues.js';
import Parser from "./parser.js";
import ChunkReader from '../../components/chunkReader.js';

export default class DEVS extends Parser { 
		
	constructor(fileList) {
		super(fileList);
		this.transitions = [];
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
		
		
		var ma = Array.Find(files, function(f) { return f.name.match(/.ma/i); });
		var log = Array.Find(files, function(f) { return f.name.match(/.log/i); });
		var svg = Array.Find(files, function(f) { return f.name.match(/.svg/i); });

		var p1 = Sim.ParseFile(ma, this.ParseMaFile.bind(this));
		var p2 = Sim.ParseFileByChunk(log, this.ParseLogChunk.bind(this));
		var p3 = Sim.ParseFile(svg, this.ParseSVGFile.bind(this));

		var defs = [p1, p2,p3];
	
		Promise.all(defs).then((data) => {
			
			var info = {
				simulator : "DEVS",
				name : log.name.replace(/\.[^.]*$/, ''),
				files : files,
			
			}
			
			this.size = this.ma.models.length;
			this.models = this.ma.models;
			this.svg=this.svg;
			//simulation.Initialize(info, settings);

			d.Resolve();
		});
		
		return d.promise;
	}
	ParseSVGFile( file) 
	{
		this.svg=file;
	}
	ParseMaFile( file) {
		var models = file.match(/(?<=\[).+?(?=\])/g);
		
		this.ma = { 
			models : Array.Map(models, (m) => { return m.toLowerCase(); })
		};
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
			
			// Parse model id
			var id = split[3].trim();
			
			
			if (id.length < 1) return;
			
			// Parse state value, timestamp used as frame id
			var v = parseFloat(split[4]);
			var fId = split[1].trim();
			
		
			var a = new Transition(id, v);
			this.transitions.push(a);
		
		//	f.AddTransition(new Transition(id, v));
			
		}.bind(this));
		Array.ForEach(lines, function(line) {
			var split = line.split("/");
			
			// Parse model id
			var id = split[3].trim();
			
			
			if (id.length < 1) return;
			
			// Parse state value, timestamp used as frame id
			var v = parseFloat(split[4]);
			var fId = split[1].trim();
						
			//var a = new ParsedValues(frame, model, state,input, output,error,phase);
			//		this.parsedValues.push(a);
			var a = new Transition(id, v);
			this.transitions.push(a);
		
		}.bind(this));

	
		console.log(this.transitions);


		this.Emit("Progress", { progress: progress });
	}
}