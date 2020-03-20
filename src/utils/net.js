import Lang from './lang.js';

export default class Net {
	

	/**
	* Execute a web request
	*
	* Parameters :
	*	url : String, the request URL
	*	success : Function, the success callback function
	*	failure : Function, the failure callback function
	* Return : none
	*
	* TODO : This should return a promise object
	*
	*/
	static Request(url, headers, responseType) {
		var d = Lang.Defer();
		
		var xhttp = new XMLHttpRequest();
		
		xhttp.onreadystatechange = function() {
			if (this.readyState != 4) return;
		
			if (this.status == 200) d.Resolve(this.response);
			
			else d.Reject({ status:this.status, response:this.response });
		};
		
		xhttp.open("GET", url, true);
		
		if (headers) {
			for (var id in headers) xhttp.setRequestHeader(id, headers[id]);
		}
		
		if (responseType) xhttp.responseType = responseType;   
		
		xhttp.send();
		
		return d.promise;
	}
	
	/**
	* Get a parameter value from the document URL
	*
	* Parameters :
	*	name : String, the name of the parameter to retrieve from the URL
	* Return : String, the value of the parameter from the URL, an empty string if not found
	*/
	static GetUrlParameter (name) {				
		name = name.replace(/[\[\]]/g, '\\$&');
		
		var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
		
		var results = regex.exec(window.location.href);
		
		if (!results) return null;
		
		if (!results[2]) return '';
		
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}
	
	/**
	* Download content as a file
	*
	* Parameters :
	*	name : String, the name of the file to download
	*	content : String, the content to assign to the downloaded file
	* Return : none
	*/
	static Download(name, content) {
		var link = document.createElement("a");
		
		link.href = "data:application/octet-stream," + encodeURIComponent(content);
		link.download = name;
		link.click();
		link = null;
	}

	static CreateGistSVG(svg)
	{	var gh = new GitHub({
		   username: 'shreyataneja',
		   password: 'kriti98825'
		   /* also acceptable:
		      token: 'MY_OAUTH_TOKEN'
		    */
		});
	
		var gist_var_svg = {
		   public: true,
		   description: 'SVG gist',
		   files: {
		      "SVGfile.svg": {
		         content: svg
		      }
		   }
		};
		let gist_svg = gh.getGist(); // not a gist yet
		var p = gist_svg.create(gist_var_svg).then(function({data}) {
		return data.url;
		}.bind(this));

 		return p;
	}


	static CreateGistCSV( CSVstring)
	{
		var gh = new GitHub({
		   username: 'shreyataneja',
		   password: 'kriti98825'
		   /* also acceptable:
		      token: 'MY_OAUTH_TOKEN'
		    */
		});
		var gist_var_csv = {
		   public: true,
		   description: 'CSV gist',
		   files: {
		      "CSVfile.csv": {
		         content: CSVstring
		      }
		   }
		};
		
		let gist = gh.getGist(); // not a gist yet
		var p = gist.create(gist_var_csv).then(function({data}) {
		 return data.url;
		}.bind(this));
		return p;
	}
}