angular.module('controllers', ['services'])

.controller('homeCtrl', function($scope,dataCall,staticData) {

		$scope.options = {};
		$scope.data = {};

		// var fireRef = new Firebase("https://ionia.firebaseio.com");
		// var champions = $firebaseObject(fireRef);
		// champions.$bindTo($scope, "champions");

		dataCall.freeRotation().get(function(data) {
			$scope.rotation = data.champions;
		});

		$scope.championData = function(championId) {
			return staticData.getChampion(championId);
		};

		$scope.shards = staticData.getShards();
		$scope.options.region = $scope.shards[0].slug;

		$scope.updateStatus = function(region) {
			dataCall.shardStatus(region).get(function(data) {
				$scope.data.status = data;
			});
		};

		$scope.updateStatus($scope.shards[0].slug);

		$scope.statusCheck = function(yesno) {
			if(yesno == "online") {
				return "done";
			} else {
				return "error";
			}
		};
})

.controller('appCtrl', function($scope) {
});