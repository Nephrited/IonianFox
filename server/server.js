var express 	= require('express');
var request 	= require('request');
var async 		= require('async');
var apicache	= require('apicache');

var app 		= express();
var router 		= express.Router();
var cache 		= apicache.options({debug:true}).middleware;

var port 		= 46642;
var api 		= {
					"key": "7f2f2ee9-63ea-4c78-8a1e-5307bbeacbf6",
					"euw": "https://euw.api.pvp.net/api/lol/euw/v1.2/",
					"static": "https://global.api.pvp.net/api/lol/static-data/euw/v1.2/",
					"shards": "http://status.leagueoflegends.com/shards"
					};

var asyncSetup 	= [];

var staticTemp = {};

console.log('"Wind howls around your feet');
console.log('The path is being set out');
console.log('Soon you shall arrive"');
console.log("");

/**
 * Fetch the latest league version.
 *
 * This is to be compared to the stored copy to see if an update is required.
 */
function fetchVersion(callback) {
	request(api.euw+"versions", function(err,res,body) {
		if(!err && res.statusCode === 200) {
			var data = JSON.parse(body);
			console.log(data);
			staticTemp.version = data;
		} else if(!err) {
			console.log("Error "+res.status_code);
		} else {
			console.log(err);
		}

		return callback();
	});
}

/**
 * Fetches the list of free to play champions from the Riot Servers
 * To be completed
 * @param  {[type]} callback) {	request(api.euw+"champion?freeToPlay [description]
 * @return {[type]}           [description]
 */
function fetchRotation(callback) {
	request(api.euw+"champion?freeToPlay=true&api_key="+api.key, function(err,res,body){
		if(!err && res.statusCode === 200) {
			var data = JSON.parse(body);
			staticTemp.rotation = data;
		} else if(!err) {
			console.log("Error "+res.status_code);
		} else {
			console.log(err);
		}

		return callback();
	});
}

/**
 * Fetches champion data.
 * @param  {String} callback) {	request(api.static+"champion?api_key [description]
 * @return {[type]}           [description]
 */
function fetchChampions(callback) {
	request(api.static+"champion?api_key="+api.key+"&champData=image", function(err,res,body){
		var data = JSON.parse(body);

		if(!err && res.statusCode === 200) {
			staticTemp.champions = data;
		} else if(!err) {
			console.log("Error "+data.status.status_code+": "+data.status.message);
		} else {
			console.log(err);
		}

		return callback();
	});
}

function fetchShards(callback) {
	request(api.shards, function(err,res,body) {
		var data = JSON.parse(body);

		if(!err && res.statusCode === 200) {
			staticTemp.shards = data;
		} else if(!err) {
			console.log("Error "+data.status.status_code+": "+data.status.message);
		} else {
			console.log(err);
		}

		return callback();
	});
}

function fetchShardStatus(shard,callback) {
	request(api.shards+"/"+shard, function(err,res,body) {
		try {
			var data = JSON.parse(body);

			if(!err && res.statusCode === 200) {
				return callback(null,data);
			} else if(!err) {
				console.log("Error "+data.status.status_code+": "+data.status.message);
			} else {
				console.log(err);
			}
		} catch(e) {
			return callback("Unable to parse data:"+e);
		}

		return callback();
	});
}

/**
 * Keep this first - Allows CORS
 */
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

/**
 * Respond to rotation queries
 */
router.get('/rotation', cache('60 minutes'), function(req,res) {
	fetchRotation(function() {
		res.json(staticTemp.rotation);
	});
});

/**
 * Return static champion data
 */
router.get('/champions', cache('24 hours'), function(req,res) {
	res.json(staticTemp.champions);
});

router.get('/shards', cache('1 week'), function(req,res) {
	fetchShards(function() {
		res.json(staticTemp.shards);
	});
});

router.get('/shards/:shard', cache('30 seconds'), function(req,res) {
	fetchShardStatus(req.params.shard, function(err,data) {
		if(!err) {
			res.json(data);
		} else {
			next();
		}
		
	});
});

/**
 * Handle everything else!
 */
app.use(function (err, req, res, next) {  
	if (err.msg) {
		res.send(500, { error: err.msg });
	} else {
		res.send(500, { error: '500 - Internal Server Error' });
	}
});

asyncSetup.push(fetchRotation,fetchChampions,fetchVersion);

async.parallel(asyncSetup, function() {
	setupComplete();
});

/**
 * Bind to port and link to router
 * @return void
 */
function setupComplete() {
	app.use('/api',router);
	console.log('Ready for your orders, summoner');
}

app.listen(port, function() {
	console.log('A server of Ionian descent is listening on port '+port);
});