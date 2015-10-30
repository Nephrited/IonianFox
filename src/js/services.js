angular.module('services', [])

.factory('staticData', function() {
	var champions = {};
	var shards = {};
	var missingChamp = {
		name: "Unknown Champion"
	};

	return {		
		setShards: function(data) {
			shards = data;
		},getShards: function () {
			return shards;
		}
	};
})

.factory('dataCall', function($resource,$q,staticData,ionia) {

	return {
		freeRotation: function() {
			var requestURL = ionia.url+"rotation";
			return $resource(requestURL);
		},shards: function() {
			var requestURL = ionia.url+"shards";
			var defer = $q.defer();
			
			$resource(requestURL).query(function(data) {
				staticData.setShards(data);
				return defer.resolve();
			});

			return defer.promise;
		},shardStatus: function(shard) {
			var requestURL = ionia.url+"shards/"+shard;
			return $resource(requestURL);
		}
	};
});