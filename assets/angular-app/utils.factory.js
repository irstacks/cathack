'use strict';

app.factory("Utils", ["Config", "$log", function (Config, $log) {

    var goMode = {name: 'go'};
    var javascriptMode = {name: 'javascript'};
    var markdownMode = {name: 'markdown'};
    var pythonMode = {name: 'python'};
    var rubyMode = {name: 'ruby'};
    var rMode = {name: 'r'};
    var shellMode = {name: 'shell'};
    var swiftMode = {name: 'swift'};
    var htmlmixedMode = {name: 'htmlmixed', scriptTypes: [{matches: /\/x-handlebars-template|\/x-mustache/i,
                                                           mode: null},
                                                          {matches: /(text|application)\/(x-)?vb(a|script)/i,
                                                           mode: "vbscript"}]};
    var htmlembeddedMode = {name: 'htmlembedded'};
    var cssMode = {name: 'css'}

	function typeOf (obj) {
	  return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
	}

  // returns editor config object extending a given object (likely {mode: ____})
  function setEditorOptions(obj) {
      var a  = angular.extend({}, Config.EDITOROPTIONS, obj);
      // $log.log("Utils.setEditorOptions: " , a);
      return a;
	}

	function getLanguageModeByExtension(name) {
	  var o = "";
	  var exs = name.split(".");
	  // console.log('exs -> ' + JSON.stringify(exs));
	  for (var i = 0; i < exs.length ; i++) {
	    var ex = exs[i];
	    // console.log("checking case: " + ex);
	    switch (ex) {
	      case 'js':
	        o = javascriptMode;
	        break;
        case 'erb':
	      case 'html':
	        o = htmlmixedMode;
          break;
      case 'css':
      case 'less':
      case 'scss':
          o = cssMode;
          break;
	      case 'go':
	        o = goMode;
	        break;
	      case 'md':
	      case 'mdown':
	      case 'markdown':
	        o = markdownMode;
	        break;
	      case 'py':
	        o = pythonMode;
	        break;
	      case 'rb':
	        o = rubyMode;
	        break;
	      case 'r':
	        o = rMode;
	        break;
	      case 'sh':
	      case 'zsh':
	        o = shellMode;
	        break;
	      case 'swift':
	        o = swiftMode;
	        break;
        default:
	        o = markdownMode;
	        break;
      }
	  }
    // $log.log("language by extension -> " , o);
	  return o;
	}


	return {
		typeOf: typeOf,
		setEditorOptions: setEditorOptions,
		getLanguageModeByExtension: getLanguageModeByExtension,
		goMode: goMode,
		javascriptMode: javascriptMode,
		markdownMode: markdownMode,
		pythonMode: pythonMode,
		rubyMode: rubyMode,
		rMode: rMode,
		shellMode: shellMode,
		swiftMode: swiftMode,
		htmlmixedMode: htmlmixedMode,
		htmlembeddedMode: htmlembeddedMode
	};
}]);
