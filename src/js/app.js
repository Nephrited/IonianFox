angular.module('ionianFox', ['controllers','services','ngRoute','ngMaterial','ngResource','firebase'])

.constant("riotApi", {
	"key": "7f2f2ee9-63ea-4c78-8a1e-5307bbeacbf6",
	"euw": "https://euw.api.pvp.net/api/lol/euw/v1.2/",
	"static": "https://global.api.pvp.net/api/lol/static-data/euw/v1.2/"
})

.config(function($routeProvider,$mdThemingProvider,$mdIconProvider) {

	$routeProvider.otherwise('/');

	$routeProvider.when('/', {
		templateUrl: './templates/_home.html',
		controller: 'homeCtrl',
		resolve:  {
			loadChampions: function(dataCall) {
				return dataCall.staticChampions();
			},loadShards: function(dataCall) {
				return dataCall.shards();
			}
		}
	});

  	$mdThemingProvider.theme('default')
	  	.primaryPalette('grey', {
	      'default': '100',
	      'hue-1': '500',
	      'hue-2': '600',
	      'hue-3': '900'
	    })

	    .accentPalette('purple', {
	      'default': '200'
	    })
	    .dark();
});