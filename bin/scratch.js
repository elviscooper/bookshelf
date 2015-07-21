var mongoose = require('mongoose');

require('../models/Books.js');
require('../models/Ideas.js');


var Book = mongoose.model('Book');
var Idea = mongoose.model('Idea');

var db = mongoose.connection;
var dbUrl = 'mongodb://localhost/bookshelf';

mongoose.connect(dbUrl, function (err) {

	if (err) {
	    return console.log('there was a problem connecting to the database!' + err);
	}

  	console.log('connected to database: ', dbUrl);

	Book.remove({_id:'55a2a31272f047df9fef17c0'} , function(err) {
	  
	    if (err) { console.log('could not find book'); }

	});
});