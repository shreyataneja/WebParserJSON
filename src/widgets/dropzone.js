'use strict';

import Lang from '../utils/lang.js';
import Array from '../utils/array.js';
import Widget from '../ui/widget.js';

export default Lang.Templatable("Widget.Dropzone", class Dropzone extends Widget { 

	constructor(container) {
		super(container);
		
		this.files = null;
		
		this.Node("input").addEventListener("change", this.OnInput_Change.bind(this));
		
		
	}
	
	Template() {
		return  "<button class='file-upload-btn' type='button'>Add Files here</button>"+
  "<div class='image-upload-wrap'>"+
   " <input  handle='input' class='file-upload-input' type='file' multiple/>"+
    "<div class='drag-text'>"+
     " <h3>Drag and drop files here</h3>"+
    "</div>"+
  "</div>"+
  "<div class='file-upload-content'>"+
  "<span handle = 'file_name'></span>"+
 " </div>";



	}
	
	OnInput_Change(ev) {
		if (ev.target.files.length == 0) return;
				
		this.files = Array.Map(ev.target.files, function(f) { 
			return f;
		});
		
		var css = ev.target.files.length > 0 ? "fas fa-thumbs-up" : "fas fa-exclamation-triangle";
		this.Node("file_name").innerHTML='Selected Files: '+this.FilesAsString();
		this.files=ev.target.files;
		
		this.Emit("Change", { files:this.files });
	}
	FilesAsString() {

		return this.files.map(f => f.name).join(", ");
	}
	
	Reset() {
		this.Node("input").value = "";
	}
});