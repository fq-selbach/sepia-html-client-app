//Embedded NLU (e.g. for demo/offline mode)
function sepiaFW_build_embedded_nlu(){
	var Nlu = {};
	
	//Get an NluResult (just like the server would produce it)
	Nlu.interpretMessage = function(message){
		var dataType = message.data.dataType;
		var lang = message.data.parameters.lang;
		var text = message.text;

		var nluResult = {
			"result": "fail",
			"environment": SepiaFW.config.environment,
			"mood": 6,
			"bestDirectMatch": "---",
			"context": "default",
			"certainty": 1.00,
			"language": lang,
			"parameters": {}
		};
		//DIRECT CMD
		if (dataType == "directCmd"){
			//convert cmd string
			var data = message.text.split(";;");
			var cmd = data[0];
			nluResult.command = cmd;
			nluResult.context = cmd; 		//this would usually carry more data (e.g. last 3 contexts)
			nluResult.parameters = {};
			if (data.length > 1){
				for (var i=1; i<data.length; i++){
					var pair = data[i].split('=');
					var k = pair.shift();
					var v = pair.join('=');
					if (!!k && v != undefined){
						nluResult.parameters[k] = v;
					}
				}
			}
			nluResult.result = "success";
			//console.log(message.text);
			//console.log(JSON.stringify(nluResult));

		//TEXT
		}else if (dataType == "openText"){
			//Mixed languages:

			//Lists
			if (text.match(/(list|todo)/i)){
				getListCmd(nluResult, text);
			
			//News
			}else if (text.match(/(news|nachrichten)/i)){
				getNewsCmd(nluResult, text);
			
			//Radio
			}else if (text.match(/(radio|music|musik)/i)){
				getRadioCmd(nluResult, text);
			
			//Websearch
			}else if (text.match(/(search|find|such(e|)|finde|link|^http(s|):.*)\b/i)){
				getOpenLinkCmd(nluResult, text);
			}

			return nluResult;
		}else{
			SepiaFW.debug.info("Embedded.Nlu - offline NLU cannot handle data-type: " + dataType);
		}
		return nluResult;
	}

	//--- Dummy results with optional "real" NLU ---

	//Link
	function getOpenLinkCmd(nluResult, inputText){
		var iconUrl = "";
		var title = "Link";
		var desc = "Click to open";
		var url = "https://sepia-framework.github.io/app/search.html";
		var answer = "Ok";
		if (inputText){
			inputText = inputText.replace(/.*\b(for|nach|search|find|such(e|)|finde|link)\b/i, "").trim();
		}
		if (inputText && (inputText.indexOf('http:') == 0 || inputText.indexOf('https:') == 0)){
			url = inputText;
			title = "Link";
			desc = "<i>" + inputText + "</i>";
		}else if (inputText){
			url = "https://www.google.com/search?q=" + encodeURIComponent(inputText);
			title = "Google Search";
			desc = "<i>" + inputText + "</i>";
		}else{
			iconUrl = "https://sepia-framework.github.io/img/icon.png";
			title = "S.E.P.I.A.";
			desc = "Your personal, private, open-source assistant";
			url = "https://sepia-framework.github.io";
			if (nluResult.language == "de"){
				answer = "Kennst du eigentlich meine Homepage?";
			}else if (nluResult.language == "en"){
				answer = "Have you seen my homepage?";
			}	
		}
		nluResult.result = "success";
		nluResult.context = "open_link";
		nluResult.parameters = {
			"icon_url": iconUrl,
			"answer_set": answer,
			"description": desc,
			"title": title,
			"url": url
		};
		nluResult.command = "open_link";
		return nluResult;
	}

	//List
	function getListCmd(nluResult, inputText){
		nluResult.result = "success";
		nluResult.context = "lists";
		nluResult.parameters = {
			"list_type": "<todo>",
			"list_item": "",
			"list_subtype": "",
			"action": "<show>"
		};
		nluResult.command = "lists";
		return nluResult;
	}

	//News
	function getNewsCmd(nluResult, inputText){
		nluResult.result = "success";
		nluResult.context = "news";
		nluResult.parameters = {
			"news_type": "",
			"news_section": "",
			"sports_team": "",
			"sports_league": ""
		};
		nluResult.command = "news";
		return nluResult;
	}

	//Radio
	function getRadioCmd(nluResult, inputText){
		nluResult.result = "success";
		nluResult.context = "music_radio";
		nluResult.parameters = {
			"radio_station": "",
			"genre": "rock",
			"action": "<on>"
		};
		nluResult.command = "music_radio";
		return nluResult;
	}
	
	return Nlu;
}