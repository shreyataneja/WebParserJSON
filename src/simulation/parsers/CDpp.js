'use strict';

import Lang from '../../utils/lang.js';
import Array from '../../utils/array.js';
import Sim from '../../utils/sim.js';
import TransitionCSV from '../transitionCSV.js';
import Parser from "./parser.js";
import ChunkReader from '../../components/chunkReader.js';
import Simulation from '../simulation.js';

export default class CDpp extends Parser { 
	
	constructor(files) {
		super(files);
		this.transitionCSV = [];
		this.val ;
		this.palette ;
		this.ma ;
		this.pal;
	}
	
	IsValid() {
		var d = Lang.Defer();
		var log = Array.Find(this.files, function(f) { return f.name.match(/.log/i); });
		var ma = Array.Find(this.files, function(f) { return f.name.match(/.ma/i); });	
		var val = Array.Find(this.files, function(f) { return f.name.match(/.val/i); });
		var pal = Array.Find(this.files, function(f) { return f.name.match(/.pal/i); });
		
		// TODO : This should reject
		if (!log || !ma) d.Resolve(false);
			
		var r = new ChunkReader();
		//if(log && ma)
		r.ReadChunk(ma, 200).then((ev) => { 
			var type = ev.result.match(/type\s*:\s*(.+)/);

			d.Resolve(type && type[1] == "cell");
		});
		
		return d.promise;
	}
	
	Parse(files) {
		var d = Lang.Defer();
		var simulation = new Simulation();
	
		
		var val = Array.Find(files, function(f) { return f.name.match(/.val/i); });
		var pal = Array.Find(files, function(f) { return f.name.match(/.pal/i); });
		var ma = Array.Find(files, function(f) { return f.name.match(/.ma/i); });
		var log = Array.Find(files, function(f) { return f.name.match(/.log/i); });
		
		var p1 = Sim.ParseFile(val, this.ParseValFile.bind(this));
		var p2 = Sim.ParseFile(pal, this.ParsePalFile.bind(this));
		var p3 = Sim.ParseFile(ma, this.ParseMaFile.bind(this));
		var p4 = Sim.ParseFileByChunk(log, this.ParseLogChunk.bind(this));
			
		var defs = [p1, p2, p3, p4];
	
		Promise.all(defs).then((data) => {

			
			var info = {
				simulator : "CDpp",
				name : log.name.replace(/\.[^.]*$/, ''),
				files : files,
			}
		
			simulation.transition = this.transitionCSV;
			simulation.palette=this.palette;
			simulation.val=this.val;
			simulation.ma=this.ma;
			

			simulation.Initialize(info);

			d.Resolve(simulation);

			});
		

		
		return d.promise;
	}
	
	
	ParseValFile( file) {

		this.palette=file;

	
	}
	
	ParseMaFile( file) {

		this.ma=file;

	}
	
	
	ParsePalFile(file) {	

		this.val=file;

	}	
	

	ParseLogChunk( chunk, progress) {
		var lines = [];
		var start = chunk.indexOf('Mensaje Y', 0);
			
		while (start > -1 && start < chunk.length) {			
			var end = chunk.indexOf('\n', start);
			
			if (end == -1) end = chunk.length + 1;
			
			var length = end - start;
			
			lines.push(chunk.substr(start, length));

			var start = chunk.indexOf('Mensaje Y', start + length);
		}
		
		Array.ForEach(lines, function(line) {
			var split = line.split("/");
			
			// Parse coordinates
			var i = split[2].indexOf('(');
			var j = split[2].indexOf(')');
			var c = split[2].substring(i + 1, j).split(',');
			
			// TODO : Does this ever happen?
			if (c.length < 2) return;
			
			// Parse coordinates, state value & frame timestamp
			var coord = this.GetCoord(c);
			var val = parseFloat(split[4]);
			var fId = split[1].trim();
			var model = split[2].substring(0,  split[2].indexOf('(')).trim();

			var a = new TransitionCSV(fId, model, val,"", "","","",val,coord);
			this.transitionCSV.push(a);			
			
		
			
		}.bind(this));
		
		return this.transitionCSV;

	}
	
	GetCoord(sCoord) {
		// Parse coordinates
		var x = parseInt(sCoord[1],10);
		var y = parseInt(sCoord[0],10);
		var z = parseInt(sCoord.length==3 ? sCoord[2] : 0, 10);
		
		return [x, y, z];
	}
}