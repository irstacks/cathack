'use strict';

app.factory("FS", ['$log', '$http', 'Config', function ($log, $http, Config) {

	var fsLib = [];

	function storeFS(resdata) {
		fsLib.length = 0;
		for (var i = 0; i < resdata.length; i++) {
			fsLib.push(resdata[i]);
		}
		$log.log('FS: ', fsLib);
	}

	function getFS() {
		return fsLib;
	}

	function fetchFS() {
		var url = Config.API_URL + Config.ENDPOINTS.FS;
		return $http.get(url);
	}

	function importDir(path) {
		var url = Config.API_URL + 
						  Config.ENDPOINTS.FS + 
						  Config.ENDPOINTS.BUCKETS;
		var config = {
			params: {
				path: JSON.stringify(path)
			}
		};
		return $http.get(url, config); // c.JSON(200, gin.H{"b": bs, "s": ss})
	}

	function importFile(path) {
		var url = Config.API_URL + 
								  Config.ENDPOINTS.FS + 
								  Config.ENDPOINTS.SNIPPETS;
		var config = {
			params: {
				path: JSON.stringify(path)
			}
		};
		return $http.get(url, config); // c.JSON(200, gin.H{"b": b, "s": s})
	}

	function writeSnippetToFile(snippet) {
		var url = Config.API_URL + 
							Config.ENDPOINTS.FS + 
							Config.ENDPOINTS.SNIPPETS + "/" + snippet.id + 
							"?bucketId=" + snippet.bucketId;
		return $http.post(url);
	}

	function writeBucketToFS(bucket) {
		var url = Config.API_URL + 
							Config.ENDPOINTS.FS + 
							Config.ENDPOINTS.BUCKETS + "/" + bucket.id;
		return $http.post(url);
	}

	return {
		fetchFS: fetchFS,
		storeFS: storeFS,
		getFS: getFS,
		importFile: importFile,
		importDir: importDir,
		writeSnippetToFile: writeSnippetToFile,
		writeBucketToFS: writeBucketToFS
	};
}]);