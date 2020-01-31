'use strict';

import Lang from '../../utils/lang.js';
import Array from '../../utils/array.js';
import Sim from '../../utils/sim.js';
import Transition from '../transition.js';
import Parser from "./parser.js";
import ChunkReader from '../../components/chunkReader.js';

export default class FSM extends Parser { 
		
	constructor(fileList) {
		super(fileList);
		
		this.transitions = [];
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
		var d = Lang.Defer();
		
		
		var txt = Array.Find(files, function(f) { return f.name.match(/.txt/i); });
		//var svg = Array.Find(files, function(f) { return f.name.match(/.svg/i); });

		var p1 = Sim.ParseFile(txt, this.ParseTxtFile.bind(this));
		//var p2 = Sim.ParseFile(svg, this.ParseSVGFile.bind(this));

		var defs = [p1];
	
		Promise.all(defs).then((data) => {
			
			var info = {
				simulator : "FSM",
				name : txt.name.replace(/\.[^.]*$/, ''),
				files : files,
			
			}
			
			//this.size = this.ma.models.length;
			//this.models = this.ma.models;
			//this.svg=this.svg;
			//simulation.Initialize(info, settings);

			d.Resolve();
		});
		
		return d.promise;
	}

	
	ParseTxtFile( chunk, progress) {		
		var lines = [];
		var start = chunk.indexOf('State', 0);
	
		while (start > -1 && start < chunk.length) {			
			var end = chunk.indexOf('\n', start);
			
			if (end == -1) end = chunk.length + 1;
			
			var length = end - start;
			
			lines.push(chunk.substr(start, length));

			var start = chunk.indexOf('State', start + length);
		}
		
		console.log(lines);
		this.Emit("Progress", { progress: progress });
	}
}