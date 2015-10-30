angular.module('ionianFox', ['controllers','services','ngRoute','ngMaterial','ngResource','ngAnimate'])

.constant("ionia", {
	"url": "http://52.17.103.200:46642/api/",
	//"url": "http://localhost:46642/api/"
})

.config(function($routeProvider,$mdThemingProvider,$mdIconProvider) {

	$routeProvider.otherwise('/');

	$routeProvider.when('/', {
		templateUrl: './templates/_home.html',
		controller: 'homeCtrl'
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