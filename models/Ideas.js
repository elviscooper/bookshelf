var mongoose = require('mongoose');

var IdeaSchema = new mongoose.Schema({
  body: String,
  contributor: String,
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }
});

mongoose.model('Idea', IdeaSchema);