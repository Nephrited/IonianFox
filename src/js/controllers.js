angular.module('controllers', ['services'])

.controller('homeCtrl', function($scope,dataCall,staticData) {

		$scope.options = {};
		$scope.data = {};

		dataCall.freeRotation().query(function(data) {
			$scope.rotation = data;
		});

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