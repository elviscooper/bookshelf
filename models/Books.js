var mongoose = require('mongoose');

var BookSchema = new mongoose.Schema({
  title: String,
  author: String,
  contributor: String,
  description: String,
  link: String,
  ideas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Idea' }]
});

mongoose.model('Book', BookSchema);

/*
BookSchema.methods.upvote = function(cb) {
	this.upvotes += 1;
	this.save(cb);
};*/