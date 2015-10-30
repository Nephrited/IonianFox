var request 	= require('request');
var async 		= require('async');
var mongo		= require('mongodb').MongoClient;

module.exports = {
	
	/**
	 * Connects to a mongodb
	 * @param  String					dburl		Address of the mongo db, including port and db name
	 * @param  function(error,data) 	callback	callback function
	 * @return function(error,data)     callback
	 */
	connectDb: function(dburl,callback) {
		mongo.connect(dburl, function(err, db) {
			if(!err) {
				return callback(null,db);
			} else {
				return callback(err);
			}
		});
	},

	/**
	 * Fetch the latest league version.
	 *
	 * This is to be compared to the stored copy to see if an update is required.
	 */
	fetchVersion: function(api,db,callback) {
		request(api.static+"realm?api_key="+api.key, function(err,res,body) {
			if(!err && res.statusCode === 200) {
				var data = JSON.parse(body).v;
				var store = {"version":data};
				db.collection('versions').update(store,store,{upsert:true});
				return callback(null,data);
			} else if(!err) {
				var errorData = JSON.parse(body);
				return callback(errorData.status.message);
			} else {
				return callback(err);
			}
		});
	},

	/**
	 * [staticVersionCheck description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	staticVersionCheck: function(db,callback) {
		function champions(callback) {
			db.collection('champions').findOne({"version":{$exists:true}}, function(err,res) {
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
			db.collection('versions').findOne({}, function(err,res) {
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

	},

	/**
	 * Fetches champion data.
	 * @param  {String} callback) {	request(api.static+"champion?api_key [description]
	 * @return {[type]}           [description]
	 *
	 * Redo me to use my callbacks properly
	 */
	fetchChampions: function(api,db,callback) {

		request(api.static+"champion?api_key="+api.key+"&champData=all", function(err,res,body){
			var data = JSON.parse(body);
			var championData = [];

			for(var champion in data.data){
			    championData.push(data.data[champion]);
			}

			championData.push({"version":data.version});

			if(!err && res.statusCode === 200) {

				db.collection('champions').deleteMany({}, function(err,res) {
					if(!err) {
						db.collection('champions').insert(championData);
					} else {
						return callback(err);
					}
				});
				
				staticTemp.champions = data;

			} else if(!err) {
				return callback("Error "+data.status.status_code+": "+data.status.message);
			} else {
				return callback(err);
			}

			return callback();
		});
	}
};