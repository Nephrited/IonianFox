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

.factory('dataCall', function($resource,riotApi,$q,staticData) {

	return {
		freeRotation: function() {
			var requestURL = riotApi.euw+"champion?freeToPlay=true&api_key="+riotApi.key;
			return $resource(requestURL);
		},staticChampions: function() {
			var requestURL = riotApi.static+"champion?api_key="+riotApi.key+"&champData=image";
			var defer = $q.defer();

			$resource(requestURL).get(function(data) {
				staticData.setChampions(data.data);
				return defer.resolve();
			});

			return defer.promise;
		},shards: function() {
			var requestURL = "http://status.leagueoflegends.com/shards";
			var defer = $q.defer();
			
			$resource(requestURL).query(function(data) {
				staticData.setShards(data);
				return defer.resolve();
			});

			return defer.promise;
		},shardStatus: function(shard) {
			var requestURL = "http://status.leagueoflegends.com/shards/"+shard;
			return $resource(requestURL);
		}
	};
});