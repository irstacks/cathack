/*
   $$$$$$\  $$\    $$\ $$$$$$$$\ $$$$$$$\  $$\    $$\ $$$$$$\ $$$$$$$$\ $$\      $$\
  $$  __$$\ $$ |   $$ |$$  _____|$$  __$$\ $$ |   $$ |\_$$  _|$$  _____|$$ | $\  $$ |
  $$ /  $$ |$$ |   $$ |$$ |      $$ |  $$ |$$ |   $$ |  $$ |  $$ |      $$ |$$$\ $$ |
  $$ |  $$ |\$$\  $$  |$$$$$\    $$$$$$$  |\$$\  $$  |  $$ |  $$$$$\    $$ $$ $$\$$ |
  $$ |  $$ | \$$\$$  / $$  __|   $$  __$$<  \$$\$$  /   $$ |  $$  __|   $$$$  _$$$$ |
  $$ |  $$ |  \$$$  /  $$ |      $$ |  $$ |  \$$$  /    $$ |  $$ |      $$$  / \$$$ |
   $$$$$$  |   \$  /   $$$$$$$$\ $$ |  $$ |   \$  /   $$$$$$\ $$$$$$$$\ $$  /   \$$ |
   \______/     \_/    \________|\__|  \__|    \_/    \______|\________|\__/     \__|



*/



// Visit page. 
// - Connect WS. 
// - AJAX Buckets.
//  - Set currentBucket to most recent.
//  - AJAX currentBucket's snippets. 
//  - Set currentSnippet as most recent snippet 

// Websocket onmessage figures out what kind of data it's receiving. 
//  - bucket: 
//    - add bucket to lib.
//  - snippet: 
//  - hacker: 

// Clickables.
//  - choosing bucket sends AJAX req for snippets unless they're already in memory
//  - 


// library: {
//   hackers: [], 
//   buckets: [], 
//   snippets: []
// }
// 
// l--> 
// 
// hackers: [{id: 1, ip: "12.34.56.78", name: "Johnny"}, ... {}]
// buckets: [
//   {
  //   id: "234da123-", 
  //   meta: {
  //     name: "snippets", 
  //     created: 2134234123424, 
  //     updated: 23412312423, 
  //     snippetsCounts: 5
//     }
//   }
// ]
// snippets: [
  // {
  //  id: "kj2543v", 
  //  bucketId: "234da123-", 
  //  name: "main.go", 
  //  language: "go", 
  //  timestamp: 23423234234, 
  //  about: "just another test file",
  //  content: "a;lsjkfopaiwjefl;kasd;lfkja;sldkjf;laksjdf;lkajsdflkajs;ldfjka;slkdjf;alksjdf;alsjdf"
  //  }
// ]


/*
   $$$$$$\   $$$$$$\  $$\   $$\  $$$$$$\ $$$$$$$$\  $$$$$$\  $$\   $$\ $$$$$$$$\  $$$$$$\
  $$  __$$\ $$  __$$\ $$$\  $$ |$$  __$$\\__$$  __|$$  __$$\ $$$\  $$ |\__$$  __|$$  __$$\
  $$ /  \__|$$ /  $$ |$$$$\ $$ |$$ /  \__|  $$ |   $$ /  $$ |$$$$\ $$ |   $$ |   $$ /  \__|
  $$ |      $$ |  $$ |$$ $$\$$ |\$$$$$$\    $$ |   $$$$$$$$ |$$ $$\$$ |   $$ |   \$$$$$$\
  $$ |      $$ |  $$ |$$ \$$$$ | \____$$\   $$ |   $$  __$$ |$$ \$$$$ |   $$ |    \____$$\
  $$ |  $$\ $$ |  $$ |$$ |\$$$ |$$\   $$ |  $$ |   $$ |  $$ |$$ |\$$$ |   $$ |   $$\   $$ |
  \$$$$$$  | $$$$$$  |$$ | \$$ |\$$$$$$  |  $$ |   $$ |  $$ |$$ | \$$ |   $$ |   \$$$$$$  |
   \______/  \______/ \__|  \__| \______/   \__|   \__|  \__|\__|  \__|   \__|    \______/



*/
var url = "ws://" + window.location.host + "/hack/ws";
var apiUrl = "http://" + window.location.host + "/hack";
var chatUrl = "http://" + window.location.host + "/";

var ws; 

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



/*
  $$\    $$\  $$$$$$\  $$$$$$$\   $$$$$$\
  $$ |   $$ |$$  __$$\ $$  __$$\ $$  __$$\
  $$ |   $$ |$$ /  $$ |$$ |  $$ |$$ /  \__|
  \$$\  $$  |$$$$$$$$ |$$$$$$$  |\$$$$$$\
   \$$\$$  / $$  __$$ |$$  __$$<  \____$$\
    \$$$  /  $$ |  $$ |$$ |  $$ |$$\   $$ |
     \$  /   $$ |  $$ |$$ |  $$ |\$$$$$$  |
      \_/    \__|  \__|\__|  \__| \______/



*/
var cm = CodeMirror(editor[0], {
  mode:  htmlmixedMode,
  lineNumbers: true,
  tabSize: 2,
  inputStyle: "contenteditable",
  styleSelectedText: true,
  matchBrackets: true,
  autoCloseBrackets: true,
  showHint: true
  // theme: 'hopscotch'
});

var lib = {};
lib.buckets = {};
lib.snippets = {};
lib.hackers = {};

var snippetsLib = {}; // Lookup obj for all snippets (received from HandleConnect).
var currentBucket = "snippets";
var currentSnippet = {};


/*
  $$$$$$$$\ $$\       $$$$$$$$\ $$\      $$\ $$$$$$$$\ $$\   $$\ $$$$$$$$\  $$$$$$\
  $$  _____|$$ |      $$  _____|$$$\    $$$ |$$  _____|$$$\  $$ |\__$$  __|$$  __$$\
  $$ |      $$ |      $$ |      $$$$\  $$$$ |$$ |      $$$$\ $$ |   $$ |   $$ /  \__|
  $$$$$\    $$ |      $$$$$\    $$\$$\$$ $$ |$$$$$\    $$ $$\$$ |   $$ |   \$$$$$$\
  $$  __|   $$ |      $$  __|   $$ \$$$  $$ |$$  __|   $$ \$$$$ |   $$ |    \____$$\
  $$ |      $$ |      $$ |      $$ |\$  /$$ |$$ |      $$ |\$$$ |   $$ |   $$\   $$ |
  $$$$$$$$\ $$$$$$$$\ $$$$$$$$\ $$ | \_/ $$ |$$$$$$$$\ $$ | \$$ |   $$ |   \$$$$$$  |
  \________|\________|\________|\__|     \__|\________|\__|  \__|   \__|    \______/



*/

var snippetIdElem   = $("#snippetId");
var snippetBucketNameElem = $("#snippetBucketName");
var snippetNameElem = $("#snippetName");
var snippetTimeElem = $("#snippetTime");
var snippetLangElem = $("#snippetLang");
var snippetMetaElem = $("#snippetMeta");

var snippetsLibElem = $("#snippetsLib");
var snippetsInLibElems = $(".snip");

var bucketsLibElem = $("#bucketsLib");
var boltifyBucketsElem = $("#boltifyBuckets");

var createSnippetElem = $("#createSnippet");
var destroySnippetElem = $("#destroySnippet");

var editor          = $("#editor");

var errorElem = $("#show-error");


/*
  $$\   $$\ $$$$$$$$\ $$\       $$$$$$$\  $$$$$$$$\ $$$$$$$\   $$$$$$\
  $$ |  $$ |$$  _____|$$ |      $$  __$$\ $$  _____|$$  __$$\ $$  __$$\
  $$ |  $$ |$$ |      $$ |      $$ |  $$ |$$ |      $$ |  $$ |$$ /  \__|
  $$$$$$$$ |$$$$$\    $$ |      $$$$$$$  |$$$$$\    $$$$$$$  |\$$$$$$\
  $$  __$$ |$$  __|   $$ |      $$  ____/ $$  __|   $$  __$$<  \____$$\
  $$ |  $$ |$$ |      $$ |      $$ |      $$ |      $$ |  $$ |$$\   $$ |
  $$ |  $$ |$$$$$$$$\ $$$$$$$$\ $$ |      $$$$$$$$\ $$ |  $$ |\$$$$$$  |
  \__|  \__|\________|\________|\__|      \________|\__|  \__| \______/



*/



function openWS() {
  console.log("Trying to open WS.");
  ws = new WebSocket(url);
}



/*
  $$\   $$\ $$$$$$$$\ $$$$$$\ $$\       $$$$$$\
  $$ |  $$ |\__$$  __|\_$$  _|$$ |     $$  __$$\
  $$ |  $$ |   $$ |     $$ |  $$ |     $$ /  \__|
  $$ |  $$ |   $$ |     $$ |  $$ |     \$$$$$$\
  $$ |  $$ |   $$ |     $$ |  $$ |      \____$$\
  $$ |  $$ |   $$ |     $$ |  $$ |     $$\   $$ |
  \$$$$$$  |   $$ |   $$$$$$\ $$$$$$$$\\$$$$$$  |
   \______/    \__|   \______|\________|\______/



*/
// http://stackoverflow.com/questions/7390426/better-way-to-get-type-of-a-javascript-variable
// typeOf(); //undefined
// typeOf(null); //null
// typeOf(NaN); //number
// typeOf(5); //number
// typeOf({}); //object
// typeOf([]); //array
// typeOf(''); //string
// typeOf(function () {}); //function
// typeOf(/a/) //regexp
// typeOf(new Date()) //date
function typeOf (obj) {
  return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
}
function incrementedSnippetId(lib) {
  // http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
  return Math.random().toString(36).substring(7);
}
function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
}
// return 'javascript' for 'stuff.js', etc.
function getLanguageModeByExtension(name) {
  var o = "";
  var exs = name.split(".");
  console.log('exs -> ' + JSON.stringify(exs));
  // will take the last extension, ie name.js.md -> markdown
  for (var i = 0; i < exs.length ; i++) {
    var ex = exs[i];
    console.log("checking case: " + ex);
    switch (ex) {
      case 'js':
        o = javascriptMode;
        break;
      case 'html':
        o = htmlmixedMode;
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
  console.log("language by extension -> " + o);
  return o;
}

/*
  $$\    $$\ $$$$$$\ $$$$$$$$\ $$\      $$\       $$\   $$\ $$$$$$$$\ $$\       $$$$$$$\  $$$$$$$$\ $$$$$$$\   $$$$$$\
  $$ |   $$ |\_$$  _|$$  _____|$$ | $\  $$ |      $$ |  $$ |$$  _____|$$ |      $$  __$$\ $$  _____|$$  __$$\ $$  __$$\
  $$ |   $$ |  $$ |  $$ |      $$ |$$$\ $$ |      $$ |  $$ |$$ |      $$ |      $$ |  $$ |$$ |      $$ |  $$ |$$ /  \__|
  \$$\  $$  |  $$ |  $$$$$\    $$ $$ $$\$$ |      $$$$$$$$ |$$$$$\    $$ |      $$$$$$$  |$$$$$\    $$$$$$$  |\$$$$$$\
   \$$\$$  /   $$ |  $$  __|   $$$$  _$$$$ |      $$  __$$ |$$  __|   $$ |      $$  ____/ $$  __|   $$  __$$<  \____$$\
    \$$$  /    $$ |  $$ |      $$$  / \$$$ |      $$ |  $$ |$$ |      $$ |      $$ |      $$ |      $$ |  $$ |$$\   $$ |
     \$  /   $$$$$$\ $$$$$$$$\ $$  /   \$$ |      $$ |  $$ |$$$$$$$$\ $$$$$$$$\ $$ |      $$$$$$$$\ $$ |  $$ |\$$$$$$  |
      \_/    \______|\________|\__/     \__|      \__|  \__|\________|\________|\__|      \________|\__|  \__| \______/



*/
// UTILS
// 
function toggleCatChat() {
  $("#sidebar").toggle();
  $("#editing").toggleClass("col-sm-9 col-sm-6");
  $("#lib").toggleClass("col-sm-3 col-sm-2");
}

$('#catchattoggler').on("click", function () {
  toggleCatChat();
});

function showAlert(status, text) {
  $('.alert-'+status).text(text).show().delay(4000).fadeOut(100);
}

// BUCKETS. 
// 
function setWriteBucketButtonActive() {
  // make write to repo button active since changes have occured
  if (!$("#saveBucket").hasClass("btn-primary")) {
    $("#saveBucket").removeClass("btn-default").addClass("btn-primary");
  }  
}
function setWriteBucketButtonInActive() {
  // make write to repo button active since changes have occured
  if (!$("#saveBucket").hasClass("btn-default")) {
    $("#saveBucket").removeClass("btn-primary").addClass("btn-default");
  }  
}
function setCurrentBucketActive() {
  bucketsLibElem.children('.col-xs-12').each(function() {
    if (currentBucket == $(this).attr('id').replace("bucket-","")) {
      $(this).addClass("activeBucket");
    } else {
      $(this).removeClass("activeBucket");
    }
  });
}
function renderBuckets(buckets) {
  h = "";
  $.each(buckets, function (k,v) {
    h += '<div class="col-xs-12" id="bucket-' + v.name + '" onClick="return getBucket(\'' + v.name + '\')"><strong class="buck"><span class="octicon octicon-repo"></span>&nbsp;' + v.name + '</strong></div>';
  });
  bucketsLibElem.html(h);
}
// Formats each a snip for the lib.
function formatLibrarySnippetHTML(snippetObj) {

  var attrFunc = "onClick='return handleLibrarySnippetClick(this)' ";
  var cssId = "id='snip-" + snippetObj.id + "' ";

  function snipIsActiveElem() {
    if (snippetObj.id === currentSnippet.id) {
      return "style='background-color: #BEE0FC;'";  
    } else {
      return "";
    }
  } 
  var snipWrapBegin = "<div class='col-xs-12 snip text-primary' " + attrFunc + cssId + snipIsActiveElem() + ">";

  var snipIconElem = "<span class='octicon octicon-file-code'></span>&nbsp;";

  var snipNameElem = "<span class='" + " name'" + cssId + attrFunc + ">" +
                      // "[snippets] " +
                      "[" + snippetObj.bucketId + "] " +
                      snippetObj.name + 
                      "</span>&nbsp;";

  var snipLangElem = "<sup class='text-warning lang'>" + 
                      snippetObj.language + 
                      "</sup>";

  var date = new Date(parseInt(snippetObj.timestamp));
  var snipTimeElem = "<small class='text-muted time'> " + 
                     timeSince(date) + 
                     " </small>";

  // TODO: meta. 

  var snipWrapEnd = "</div>";
  
  return snipWrapBegin + 
          snipIconElem + 
          snipNameElem + 
          snipLangElem + 
          snipTimeElem + 
          // "&nbsp;" +
          // isActive + 
          snipWrapEnd;
}
// Sets GUI to reflect state of a givent snippetsLib object {} var. 
function refreshGUIForSnippetsLib(snippetsLib) {
  arrListHTML = [];
  
  // sort by most recently edited
  var keysSorted = Object.keys(snippetsLib).sort(function(a,b){return snippetsLib[a].timestamp-snippetsLib[b].timestamp});

  $.each(keysSorted, function (i, key) {
    var snip = snippetsLib[key];
    arrListHTML.push(formatLibrarySnippetHTML(snip));
  });
  snippetsLibElem.html(arrListHTML.reverse());

  // $('.isActive').hide();
  setTimeout(function () {
    $(".isActive").hide();
  }, 2000);
}

// Updates GUI snippet from lib. 
function selectSnippetFromLibById(snippetId) {
  refreshGUIForSnippet(setCurrentSnippetFromLibById(snippetId));
  refreshGUIForSnippetsLib(snippetsLib);
  setCurrentBucketActive();
}

// SNIPPETS. 
// 
// Sets GUI to reflect state of a given snippet object. 
function refreshGUIForSnippet(snippetObj) {
  snippetIdElem.text(snippetObj.id);
  snippetBucketNameElem.text(snippetObj.bucketId);
  snippetNameElem.text(snippetObj.name);
  snippetLangElem.text(snippetObj.language);
  snippetTimeElem.text(snippetObj.timestamp);
  snippetMetaElem.text(snippetObj.meta);

  cm.setValue(snippetObj.content); 
  cm.setOption("mode", getLanguageModeByExtension(snippetObj.name));
}


/*
  $$\       $$$$$$\  $$$$$$\ $$$$$$$$\ $$$$$$$$\ $$\   $$\ $$$$$$$$\ $$$$$$$\   $$$$$$\
  $$ |      \_$$  _|$$  __$$\\__$$  __|$$  _____|$$$\  $$ |$$  _____|$$  __$$\ $$  __$$\
  $$ |        $$ |  $$ /  \__|  $$ |   $$ |      $$$$\ $$ |$$ |      $$ |  $$ |$$ /  \__|
  $$ |        $$ |  \$$$$$$\    $$ |   $$$$$\    $$ $$\$$ |$$$$$\    $$$$$$$  |\$$$$$$\
  $$ |        $$ |   \____$$\   $$ |   $$  __|   $$ \$$$$ |$$  __|   $$  __$$<  \____$$\
  $$ |        $$ |  $$\   $$ |  $$ |   $$ |      $$ |\$$$ |$$ |      $$ |  $$ |$$\   $$ |
  $$$$$$$$\ $$$$$$\ \$$$$$$  |  $$ |   $$$$$$$$\ $$ | \$$ |$$$$$$$$\ $$ |  $$ |\$$$$$$  |
  \________|\______| \______/   \__|   \________|\__|  \__|\________|\__|  \__| \______/

*/
/*
  __          _______
  \ \        / / ____|
   \ \  /\  / / (___
    \ \/  \/ / \___ \
     \  /\  /  ____) |
      \/  \/  |_____/


*/
ws.onopen = function (e) {
  console.log('WebSocket open.');
  errorElem.hide();
};
ws.onclose = function (e) {
  console.log('WebSocket closed!');
  errorElem.html("<h1 onClick='return openWS()'>WebSocket closed! Try refreshing.</h1>");
  errorElem.show();
};
ws.onerror = function (err) {
  console.error('WebSocket error!');
  console.error(err);
  errorElem.html("<h1 onClick='return openWS()'>WebSocket error: " + err.type + "</h1>");
  errorElem.show();
};
// get val
ws.onmessage = function (msg) {
  var d = msg.data;

  // Receive either an array (HandleConnect, gets all snippets) 
  //                or object (HandleMessage, snippet that was updated)
  var j = JSON.parse(d);

  // Array --> 
  if (typeOf(j) === 'array') {
    
    // Also inits default bucket name. 
    handleIncomingBucket(currentBucket, j); 

  // Object --> 
  // (another session made an update to a snippet.)
  } else if (typeOf(j) === 'object') {
  
    // If incoming snippet matches current snippet by Id, 
    // update our var and GUI to reflect the incoming change.
    if (j.id === currentSnippet.id) {
      refreshGUIForSnippet(setAsCurrentSnippet(j));
    }
    updateSnippetsLibForObj(j);
  } else if (typeOf(j) === 'null') {
    currentSnippet = buildNewSnippet(currentBucket);
    // snippetsLib[currentSnippet.id] = currentSnippet;
    refreshGUIForSnippet(currentSnippet);
  }
  setWriteBucketButtonInActive();
};

/*
    _____ _    _ _____
   / ____| |  | |_   _|
  | |  __| |  | | | |
  | | |_ | |  | | | |
  | |__| | |__| |_| |_
   \_____|\____/|_____|


*/
// Make snippet update on...
// 
// content editing (via key up)
editor.keyup(function (e) {
  // http://stackoverflow.com/questions/2257070/detect-numbers-or-letters-with-jquery-javascript
  var inp = String.fromCharCode(e.keyCode);
  if ((/\S/.test(inp) || e.which === 13 || e.keyCode === 8 || e.keyCode ===  9) && (!e.metaKey || e.ctrlKey || e.altKey)) { // 224
    sendUpdate(updateCurrentSnippetFromGUI()); // updateCurrentSnippetFromGUI returns currentSnippet {} var  
  }
});
// mode picking
// snippetLangElem.on("change", function () {
//   cm.setOption("mode", $(this).val());
//   sendUpdate(updateCurrentSnippetFromGUI());
// });
// name change
snippetNameElem.on("input", function () {
  var t = $(this).text().trim();
  if (t === "") { // if name is blank replace with _
    $(this).text("_");
  }
  var l = getLanguageModeByExtension(t);
  cm.setOption("mode", l);
  snippetLangElem.text(l.name);
  sendUpdate(updateCurrentSnippetFromGUI());
});

snippetMetaElem.on("input", function () {
  sendUpdate(updateCurrentSnippetFromGUI());
});

$('#saveBucket').on("click", saveTheBucket);

boltifyBucketsElem.on('click', boltify);

createSnippetElem.on("click", function () {
  n = buildNewSnippet(currentBucket);
  refreshGUIForSnippet(setAsCurrentSnippet(n));

  updateSnippetsLibForObj(n);
  
  sendUpdate(currentSnippet); // n is now currentSnippet

  snippetNameElem.focus();
});

destroySnippetElem.on('click', function () {
  var reallyreally = window.confirm("Really really?\nThis will also destroy the file on freya if it exists.");
  if (reallyreally) {
    ID = currentSnippet.id;
    delete snippetsLib[ID];
    refreshGUIForSnippetsLib(snippetsLib);

    // set current snippet to another or new
    var nextSnippet = findSnippetThatIsnt(ID);
    
    if (typeOf(nextSnippet) !== 'undefined') {
      selectSnippetFromLibById(nextSnippet.id);  
    
    } else { // deleted the last remaining snippet
      // handled in the onmessage handlers
    }

    // send destroy signal to /hack
    $.ajax({
      method: "DELETE",
      url: "/hack/s/" + ID + "?bucket=" + currentSnippet.bucketId,
      error: function (e) {
        console.log("Ajax error.");
      },
      success: function (res) {
        console.log(res);
      }
    });  
    // --> expect broadcast of new snippets index
  }
  // NOTE: If another person is viewing/working on the snippet which is to be deleted, it won't be removed from their currentSnippet var.
  // Thus, if they modify that var in any way, the snippet will return. 
});



/*
  $$\       $$$$$$\   $$$$$$\  $$$$$$\  $$$$$$\        $$\   $$\ $$$$$$$$\ $$\       $$$$$$$\  $$$$$$$$\ $$$$$$$\   $$$$$$\
  $$ |     $$  __$$\ $$  __$$\ \_$$  _|$$  __$$\       $$ |  $$ |$$  _____|$$ |      $$  __$$\ $$  _____|$$  __$$\ $$  __$$\
  $$ |     $$ /  $$ |$$ /  \__|  $$ |  $$ /  \__|      $$ |  $$ |$$ |      $$ |      $$ |  $$ |$$ |      $$ |  $$ |$$ /  \__|
  $$ |     $$ |  $$ |$$ |$$$$\   $$ |  $$ |            $$$$$$$$ |$$$$$\    $$ |      $$$$$$$  |$$$$$\    $$$$$$$  |\$$$$$$\
  $$ |     $$ |  $$ |$$ |\_$$ |  $$ |  $$ |            $$  __$$ |$$  __|   $$ |      $$  ____/ $$  __|   $$  __$$<  \____$$\
  $$ |     $$ |  $$ |$$ |  $$ |  $$ |  $$ |  $$\       $$ |  $$ |$$ |      $$ |      $$ |      $$ |      $$ |  $$ |$$\   $$ |
  $$$$$$$$\ $$$$$$  |\$$$$$$  |$$$$$$\ \$$$$$$  |      $$ |  $$ |$$$$$$$$\ $$$$$$$$\ $$ |      $$$$$$$$\ $$ |  $$ |\$$$$$$  |
  \________|\______/  \______/ \______| \______/       \__|  \__|\________|\________|\__|      \________|\__|  \__| \______/



*/
function updateSnippetsLibForObj(snippetObj) {
  snippetsLib[snippetObj.id] = snippetObj;
  refreshGUIForSnippetsLib(snippetsLib);
}
// Updates currentSnippet var to match GUI content. 
function updateCurrentSnippetFromGUI() {
  currentSnippet.name = snippetNameElem.text();
  currentSnippet.meta = snippetMetaElem.text();
  currentSnippet.language = getLanguageModeByExtension(currentSnippet.name).name; // snippetLangElem.val();
  currentSnippet.content = cm.getValue();
  currentSnippet.timestamp = Date.now();
  
  snippetsLib[currentSnippet.id] = currentSnippet;

  snippetTimeElem.text(currentSnippet.timestamp); // just update GUI time so it's obvious it has been saved
  refreshGUIForSnippetsLib(snippetsLib);

  return currentSnippet;
}
function toSnippetObj(id, bucketId, name, lang, content, timestamp, meta) {
  return {
    id: id, 
    bucketId: bucketId,
    name: name,
    language: lang,
    content: content, 
    timestamp: timestamp, // int
    meta: meta
  };
}
// Create new snippet with incremented id.
function buildNewSnippet(currentBucket) {
  var n = toSnippetObj(incrementedSnippetId(snippetsLib), currentBucket, 'boots.go', 'go', '', Date.now(), 'is a cat');
  snippetsLib[n.id] = n; // add to library
  return n;
}
// Updates currentSnippet var to match incoming WS object.
function setAsCurrentSnippet(snippetObj) {
  currentSnippet = snippetObj;
  currentBucket = currentSnippet.bucketId;
  return currentSnippet;
}
// Sets currentSnippet var to selected snippet from lib (by id). 
function setCurrentSnippetFromLibById(snippetId) {
  currentSnippet = snippetsLib[snippetId];
  currentBucket = currentSnippet.bucketId;
  return currentSnippet;
}
// Find another snippet to show (for when one has been destroyed.)
// Returns snippet obj. 
function findSnippetThatIsnt(snippetId) {
  var s; 
  $.each(snippetsLib, function (id,snippet) {
    if (id !== snippetId) {
      s = snippet;
      false; // break out
    }
  });
  return s;
}


/*
  $$\   $$\  $$$$$$\  $$\   $$\ $$$$$$$\  $$\       $$$$$$$$\ $$$$$$$\   $$$$$$\
  $$ |  $$ |$$  __$$\ $$$\  $$ |$$  __$$\ $$ |      $$  _____|$$  __$$\ $$  __$$\
  $$ |  $$ |$$ /  $$ |$$$$\ $$ |$$ |  $$ |$$ |      $$ |      $$ |  $$ |$$ /  \__|
  $$$$$$$$ |$$$$$$$$ |$$ $$\$$ |$$ |  $$ |$$ |      $$$$$\    $$$$$$$  |\$$$$$$\
  $$  __$$ |$$  __$$ |$$ \$$$$ |$$ |  $$ |$$ |      $$  __|   $$  __$$<  \____$$\
  $$ |  $$ |$$ |  $$ |$$ |\$$$ |$$ |  $$ |$$ |      $$ |      $$ |  $$ |$$\   $$ |
  $$ |  $$ |$$ |  $$ |$$ | \$$ |$$$$$$$  |$$$$$$$$\ $$$$$$$$\ $$ |  $$ |\$$$$$$  |
  \__|  \__|\__|  \__|\__|  \__|\_______/ \________|\________|\__|  \__| \______/



*/
// Buckets.
// 
function handleIncomingBucket(name, array) {
  var j = array;
  
  var snippetsLibKeys = [];
  var snippetsLibTimes = []; 
  var snipTimeKey = {}; // {time: id} <-- lookup by most recent
  
  snippetsLib = {}; // reset in case there was a delete.
  
  // Create lookup var. 
  // Store all snippets in snippetsLib {} var (as lookup).
  for (var i = 0, len = j.length; i < len; i++) {  
    if (j[i].id !== "") {
      snippetsLibKeys.push(j[i].id);
      snippetsLibTimes.push(j[i].timestamp);
      snipTimeKey[j[i].timestamp] = j[i].id
      
      snippetsLib[j[i].id] = j[i]; // {"1": snippet, "2": othersnippet}  
    }
  }

  // If currentSnippet is {[empty]}
  if (Object.keys(currentSnippet).length === 0 && currentSnippet.constructor === Object) {

    // Set currentSnippet to be most recent. 
    var max = Math.max(...snippetsLibTimes); // the new spread operator!
    currentSnippet = snippetsLib[snipTimeKey[max]];
    
    refreshGUIForSnippet(currentSnippet);
  }

  // Refresh GUI for snippets lib. 
  refreshGUIForSnippetsLib(snippetsLib);

  // Add active class to bucket. 
  currentBucket = name;
  setCurrentBucketActive();
}
// choose from lib
function handleLibrarySnippetClick(elem) {
  console.log(elem);
  snipId = $(elem).attr('id').replace('snip-', '');
  console.log(snipId);
  selectSnippetFromLibById(snipId);
}


/*
   $$$$$$\     $$$$$\  $$$$$$\  $$\   $$\
  $$  __$$\    \__$$ |$$  __$$\ $$ |  $$ |
  $$ /  $$ |      $$ |$$ /  $$ |\$$\ $$  |
  $$$$$$$$ |      $$ |$$$$$$$$ | \$$$$  /
  $$  __$$ |$$\   $$ |$$  __$$ | $$  $$<
  $$ |  $$ |$$ |  $$ |$$ |  $$ |$$  /\$$\
  $$ |  $$ |\$$$$$$  |$$ |  $$ |$$ /  $$ |
  \__|  \__| \______/ \__|  \__|\__|  \__|



*/
function getAvailableBuckets() {
  return $.ajax({
    method: "GET",
    url: apiUrl + "/b",
    error: function (e) {
      console.log(e);
      showAlert('danger', JSON.stringify(e));
    }, 
    success: function (res) {
      console.log("got buckets -> " + JSON.stringify(res));
      renderBuckets(res);
    }
  });
}
function getBucket(name) {
  return $.ajax({
    method: "GET",
    url: apiUrl + "/b/" + name,
    error: function (e) {
      console.log(e);
      showAlert('danger', JSON.stringify(e));
    }, 
    success: function (res) {
      console.log("got bucket -> " + JSON.stringify(res));
      handleIncomingBucket(name, res);
    }
  });
}
function saveTheBucket() {
  return $.ajax({
    method: "GET",
    url: "/hack/repofy/" + currentBucket, // snippets",
    error: function (e) {
      console.error(e);
      showAlert('danger', '😒 Failed to save "' + currentBucket + '" to the file system. Error: ' + e);
    },
    success: function (res) {
      console.log(res);
      showAlert('success', '😀 Success! "' + currentBucket + '" has been saved to the filesystem.');
      setWriteBucketButtonInActive();
    }
  });
}
function boltify() {
  var reallyreally = window.confirm("This will overwrite any changes (in any collection) not saved to the file system yet. Is that OK?");
  if (reallyreally) {
    $.ajax({
      method: "GET",
      url: "/hack/boltify",
      error: function (e) {
        console.error(e);
        showAlert('danger', '😒 Failed to read from the file system. Error: ' + JSON.stringify(e));
      },
      success: function (res) {
        console.log(res);
        showAlert('success', '😀 Success! You\'re now in sync with the file system.');
        renderBuckets(res);
      }
    });  
  }
}

/*
  $$$$$$\ $$\   $$\ $$$$$$\ $$$$$$$$\
  \_$$  _|$$$\  $$ |\_$$  _|\__$$  __|
    $$ |  $$$$\ $$ |  $$ |     $$ |
    $$ |  $$ $$\$$ |  $$ |     $$ |
    $$ |  $$ \$$$$ |  $$ |     $$ |
    $$ |  $$ |\$$$ |  $$ |     $$ |
  $$$$$$\ $$ | \$$ |$$$$$$\    $$ |
  \______|\__|  \__|\______|   \__|



*/
openWS();
getAvailableBuckets();


// WS persistence.
// 
// Sends to server for a given snippet object.
function sendUpdate(snippetObj) {

  var s = JSON.stringify(snippetObj);

  setWriteBucketButtonActive();
  
  console.log("sending update: " + s);
  ws.send(s);
}
