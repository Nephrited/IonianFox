var express 	= require('express');
var request 	= require('request');
var async 		= require('async');
var apicache	= require('apicache');
var fs 			= require('fs');
var path		= require('path');
var mongo		= require('mongodb').MongoClient;

var app 		= express();
var router 		= express.Router();
var cache 		= apicache.options({debug:true}).middleware;

var url = 'mongodb://localhost:27017/ionia';
var database;
var collection;

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
 * Connect to database
 */
function connectDb(callback) {
	mongo.connect(url, function(err, db) {
		if(!err) {
			database = db;
			return callback(null);
		} else {
			return callback(err);
		}
	});
}

/**
 * Fetch the latest league version.
 *
 * This is to be compared to the stored copy to see if an update is required.
 */
function fetchVersion(callback) {
	request(api.static+"realm?api_key="+api.key, function(err,res,body) {
		if(!err && res.statusCode === 200) {
			var data = JSON.parse(body).v;
			var store = {"version":data};
			database.collection('versions').update(store,store,{upsert:true});
			return callback(null,data);
		} else if(!err) {
			errorData = JSON.parse(body);
			return callback(errorData.status.message);
		} else {
			return callback(err);
		}
	});
}

function staticVersionCheck(callback) {
	function champions(callback) {
		database.collection('champions').findOne({"version":{$exists:true}}, function(err,res) {
			if(!err && res !== null) {
				return callback(null,res);
			} else if (!err) {
				return callback(null,{"version": 0});
			} else {
				return callback(err);
			}
		});
	}

	function latestVersion(callback) {
		database.collection('versions').findOne({}, function(err,res) {
			if(!err && res !== null) {
				return callback(null,res);
			} else if (!err) {
				return callback(null,{"version": 0});
			} else {
				return callback(err);
			}
		});
	}

	async.parallel([latestVersion,champions],function(err,data) {
		if(!err) {
			if(data[0].version != data[1].version) {
				//False = Out of Sync
				return callback(null,false);
			} else {
				//True = In Sync
				return callback(null,true);
			}
		} else {
			return callback(err);
		}
	});

}

/**
 * Fetches the list of free to play champions from the Riot Servers
 * To be completed
 * @param  {[type]} callback) {	request(api.euw+"champion?freeToPlay [description]
 * @return {[type]}           [description]
 *
 * Redo me to use callbacks properly
 */
function fetchRotation(callback) {
	request(api.euw+"champion?freeToPlay=true&api_key="+api.key, function(err,res,body){
		if(!err && res.statusCode === 200) {
			var data = JSON.parse(body);
			return callback(null,data);
		} else if(!err) {
			return callback(res.status_code);
		} else {
			return callback(err);
		}

		return callback();
	});
}

/**
 * Fetches champion data.
 * @param  {String} callback) {	request(api.static+"champion?api_key [description]
 * @return {[type]}           [description]
 *
 * Redo me to use my callbacks properly
 */
function fetchChampions(callback) {

	request(api.static+"champion?api_key="+api.key+"&champData=all", function(err,res,body){
		var data = JSON.parse(body);
		var championData = [];

		for(var champion in data.data){
		    championData.push(data.data[champion]);
		}

		championData.push({"version":data.version});

		if(!err && res.statusCode === 200) {

			database.collection('champions').deleteMany({}, function(err,res) {
				if(!err) {
					database.collection('champions').insert(championData);
				} else {
					return callback(err);
				}
			});
			
			staticTemp.champions = data;

			// //Log to file
			// fs.writeFile(path.join(__dirname,"./logs/champions.log"), JSON.stringify(championData), function(err) {
			// 	if(err) {
			// 		return console.log(err);
			// 	}
			// }); 

		} else if(!err) {
			return callback("Error "+data.status.status_code+": "+data.status.message);
		} else {
			return callback(err);
		}

		return callback();
	});
}

/**
 * [fetchShards description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function fetchShards(callback) {
	request(api.shards, function(err,res,body) {
		var data = JSON.parse(body);

		if(!err && res.statusCode === 200) {
			staticTemp.shards = data;
		} else if(!err) {
			return callback("Error "+data.status.status_code+": "+data.status.message);
		} else {
			return callback(err);
		}

		return callback();
	});
}

/**
 * [fetchShardStatus description]
 * @param  {[type]}   shard    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function fetchShardStatus(shard,callback) {
	request(api.shards+"/"+shard, function(err,res,body) {
		try {
			var data = JSON.parse(body);

			if(!err && res.statusCode === 200) {
				return callback(null,data);
			} else if(!err) {
				return callback("Error "+data.status.status_code+": "+data.status.message);
			} else {
				return callback(err);
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
router.get('/rotation', cache('30 minutes'), function(req,res) {
	fetchRotation(function(err,data) {
		if(!err) {
			var rotationArray = [];
			data.champions.forEach(function(championData) {
				rotationArray.push(championData.id);
			});

			database.collection('champions').find({"id":{$in:rotationArray}},{"id":true,"name":true,"image.full":true})
				.toArray(function(err,result) {
				if(!err) {
					res.json(result);
				} else {
					console.log(err);
				}
			});
		} else {
			console.log(err);
		}
	});
});

/**
 * Return static champion data
 */
router.get('/champions', cache('1 hour'), function(req,res) {
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

//asyncSetup.push(fetchRotation,fetchChampions,fetchVersion);

/**
 * Get initial data in series
 * @param  {[type]} err   [description]
 * @param  {[type]} data) {	if(!err)   {		if(data[2] [description]
 * @return {[type]}       [description]
 */
async.series([connectDb,fetchVersion,staticVersionCheck], function(err,data) {
	if(!err) {
		if(data[2] === true) {
			setupComplete();
		} else {
			fetchStatic();
		}
	} else {
		console.log(err);
	}
});

/**
 * Fetch all static data
 * @return {[type]} [description]
 */
function fetchStatic() {
	async.parallel([fetchChampions,fetchShards],function(err,data) {
		if(!err) {
			console.log("The tomes have been updated");
			setupComplete();
		} else {
			console.log(err);
		}
	});
}

/**
 * Bind to port and link to router
 * @return void
 */
function setupComplete() {
	app.use('/api',router);
	console.log('Ready for your orders, summoner');
}

var server = app.listen(port, function() {
	console.log('A server of Ionian descent is listening on port '+port);
});