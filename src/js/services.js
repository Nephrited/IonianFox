angular.module('services', [])

.factory('staticData', function() {
	var champions = {};
	var shards = {};
	var missingChamp = {
		name: "Unknown Champion"
	};

	return {		
		setChampions: function(data) {
			champions = data;
		},getChampion: function(championId) {
			var champSelect;

			angular.forEach(champions, function(item) {
				if(item.id == championId) {
					champSelect = item;
				}
			});
			return champSelect || missingChamp;
		},getAllChampions: function() {
			return champions;
		},setShards: function(data) {
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
		},staticChampions: function() {
			var requestURL = ionia.url+"champions";
			var defer = $q.defer();

			$resource(requestURL).get(function(data) {
				staticData.setChampions(data.data);
				return defer.resolve();
			});

			return defer.promise;
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