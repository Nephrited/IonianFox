angular.module('services', [])

.factory('dataCall', function($resource,$q,ionia) {

	return {
		freeRotation: function() {
			var requestURL = ionia.url+"rotation";
			return $resource(requestURL);
		},shards: function() {
			var requestURL = ionia.url+"shards";
			return $resource(requestURL);
		},shardStatus: function(shard) {
			var requestURL = ionia.url+"shards/"+shard;
			return $resource(requestURL);
		},championData: function(id) {
			var requestURL = ionia.url+"champion/"+id;
			return $resource(requestURL);
		}
	};
});