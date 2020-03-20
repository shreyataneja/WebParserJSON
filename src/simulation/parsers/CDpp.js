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
		this.palette =[] ;
	
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
				simulatorName : log.name.replace(/\.[^.]*$/, ''),
				
			}
		
			simulation.transition = this.transitionCSV;
			simulation.palette=this.palette;
			simulation.size=this.size;
	

			simulation.Initialize(info);

			d.Resolve(simulation);

			});
		

		
		return d.promise;
	}
	
	
	ParseValFile( file) {

			file.split(/\n/).forEach(function(line) {
			if (line.length < 4) return; // probably empty line
			
			var cI = line.indexOf('('); // coordinate start
			var cJ = line.indexOf(')'); // coordinate end
			var vI = line.indexOf('='); // value start
			
			if (cI == -1|| cJ == -1 || vI == -1) return; // invalid line
			
			var split = line.substring(cI + 1, cJ).split(',');
			var coord = this.GetCoord(split);
			var val = parseFloat(line.substr(vI + 1));
			var fId = "00:00:00:000";	
			var a = new TransitionCSV(fId, "", val,"","","",val,coord);
			this.transitionCSV.push(a);			
			
		}.bind(this));

	
	}
	
	ParseMaFile( file) {
		
		var dim = null;
		var raw = file.match(/dim\s*:\s*\((.+)\)/);
		
		if (raw) dim = raw[1].split(",")
		
		else {
			var raw_h = file.match(/height\s*:\s*(.+)/);
			var raw_w = file.match(/width\s*:\s*(.+)/);
			
			dim = [raw_h[1], raw_w[1]];
		}
		
		if (dim.length == 2) dim.push(1);
		
		this.size = [+dim[1], +dim[0], +dim[2]];

	}
	
	
	ParsePalFile( file) {	
		var lines = file.split(/\n/);
		
		if (lines[0].indexOf('[') != -1) this.ParsePalTypeA( lines);
			
		else this.ParsePalTypeB( lines);
	}	
	
	ParsePalTypeA( lines) {
		// Type A: [rangeBegin;rangeEnd] R G B

		lines.forEach(function(line) { 

			console.log(line);
			// skip it it's probably an empty line
			if (line.length < 7) return;
			
			var begin = parseFloat(line.substr(1));
			var end   = parseFloat(line.substr(line.indexOf(';') + 1));
			var rgb = line.substr(line.indexOf(']') + 2).trim().split(' ');
			
			// clean empty elements
			for (var j = rgb.length; j-- > 0;) {
				if (rgb[j].trim() == "") rgb.splice(j, 1);
			}			
			
			// Parse as decimal int
			var r = parseInt(rgb[0], 10);
			var g = parseInt(rgb[1], 10);
			var b = parseInt(rgb[2], 10);
			
			this.palette.push([begin, end, [r, g, b]]);
		}.bind(this));
		
	}
	
	ParsePalTypeB( lines) {
		// Type B (VALIDSAVEFILE: lists R,G,B then lists ranges)
		var paletteRanges = [];
		var paletteColors =[];
		
		for (var i = lines.length; i-->0;){
			// check number of components per line
			var components = lines[i].split(',');
			
			if(components.length == 2) {
			// this line is a value range [start, end]
				// Use parseFloat to ensure we're processing in decimal not oct
				paletteRanges.push([parseFloat(components[0]), parseFloat(components[1])]); 
			}
			else if (components.length == 3){ 
				//this line is a palette element [R,G,B]
				// Use parseInt(#, 10) to ensure we're processing in decimal not oct
				paletteColors.push([parseInt(.95*parseInt(components[0],10)), 
									parseInt(.95*parseInt(components[1],10)), 
									parseInt(.95*parseInt(components[2],10))]); 
			}
		}

		// populate grid palette object
		for (var i = paletteRanges.length; i-- > 0;){
			this.palette.push([paletteRanges[i][0], paletteRanges[i][1], paletteColors[i]]);
		}
		
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

			var a = new TransitionCSV(fId, model, val,"", "","",val,coord);
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