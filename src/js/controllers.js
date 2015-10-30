angular.module('controllers', ['services','ngSanitize'])

.controller('homeCtrl', function($scope,dataCall,$mdDialog) {

	$scope.options = {};
	$scope.data = {};
	$scope.spinners = {};

	$scope.getRotation = function() {
		$scope.spinners.rotation = true;
		dataCall.freeRotation().query(function(data) {
			$scope.rotation = data;
			$scope.spinners.rotation = false;
		}, function(error) {
			$scope.spinners.rotation = false;
			console.log(error);
		});
	};

	$scope.getShards = function() {
		$scope.spinners.shards = true;
		dataCall.shards().query(function(data) {
			$scope.shards = data;
			$scope.options.region = $scope.shards[0].slug;
			$scope.updateStatus($scope.shards[0].slug);
			$scope.spinners.shards = false;
		}, function(error) {
			$scope.spinners.shards = false;
			console.log(error);
		});
	};

	$scope.getRotation();
	$scope.getShards();

	$scope.updateStatus = function(region) {
		$scope.spinners.shards = true;
		dataCall.shardStatus(region).get(function(data) {
			$scope.data.status = data;
			$scope.spinners.shards = false;
		}, function(error) {
			$scope.spinners.shards = false;
			console.log(error);
		});
	};

	$scope.statusCheck = function(yesno) {
		if(yesno == "online") {
			return "done";
		} else {
			return "error";
		}
	};

	$scope.openChampion = function(event,id) {
		$mdDialog.show({
			locals: {championId: id},
			controller: "championCtrl",
			templateUrl: "./templates/_champion.modal.html",
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true
		});
	};
})

.controller('appCtrl', function($scope) {
})

.controller('championCtrl', function($scope,dataCall,$mdDialog,championId) {

	$scope.updateChampion = function(id) {
		$scope.spinner = true;

		dataCall.championData(id).get(function(data) {
			$scope.data = data;
			$scope.spinner = false;
		}, function(error) {
			$scope.spinner = false;
			console.log(error);
		});
	};

	$scope.updateChampion(championId);

	$scope.cancel = function() {
		 $mdDialog.cancel();
	};
});