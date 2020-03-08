'use strict';

import Lang from '../../utils/lang.js';
import Array from '../../utils/array.js';
import Sim from '../../utils/sim.js';
import TransitionCSV from '../transitionCSV.js';
import Parser from "./parser.js";
import ChunkReader from '../../components/chunkReader.js';
import Simulation from '../simulation.js';

export default class RISE extends Parser { 
	
	constructor(files) {
		super(files);
	}
	
	IsValid() {		
		var d = Lang.Defer();
		var log = Array.Find(this.files, function(f) { return f.name.match(".log"); });
		
		if (!log) d.Resolve(null);
			
		var r = new ChunkReader();
		//if(log)
		r.ReadChunk(log, 200).then((ev) =>  d.Resolve(ev.result.indexOf("0 / L / ") >= 0));
		
		return d.promise;
	}
	
	Parse(files) {
		var d = Lang.Defer();
		var simulation = new Simulation();
		
		var log = Array.Find(files, function(f) { return f.name.match(/.log/i); });

		var p = Sim.ParseFileByChunk(log, this.ParseLogChunk.bind(this));
			
		var defs = [p];
	
		Promise.all(defs).then((data) => {
				
			var info = {
				simulator : "Lopez",
				name : log.name.replace(/\.[^.]*$/, ''),
				files : files,
			}
			simulation.transition = this.transitionCSV;
			simulation.Initialize(info);

			d.Resolve(simulation);

			
			});
		
		
		return d.promise;
	}
		
	ParseLogChunk( chunk, progress) {
		var lines = [];
		var start = chunk.indexOf('0 / L / Y', 0);
							
		while (start > -1 && start < chunk.length) {			
			var end = chunk.indexOf('\n', start);
			
			if (end == -1) end = chunk.length + 1;
			
			var length = end - start;
			
			lines.push(chunk.substr(start, length));

			var start = chunk.indexOf('0 / L / Y', start + length);
		}
				
		Array.ForEach(lines, function(line) {
			var split = line.split("/");
			
			// Parse coordinates
			var i = split[4].indexOf('(');
			var j = split[4].indexOf(')');
			var c = split[4].substring(i + 1, j).split(',');
			
			// TODO : Does this ever happen?
			if (c.length < 2) return;
			
			// Parse coordinates, state value, timestamp used as id
			var coord = this.GetCoord(c);
			var v = parseFloat(split[6]);
			var fId = split[3].trim();
			
			
			var a = new TransitionCSV(fId, "", v,"", "","","",v,coord);
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