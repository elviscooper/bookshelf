var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'BSSECRET', userProperty: 'payload'});

var Book = mongoose.model('Book');
var Idea = mongoose.model('Idea');
var User = mongoose.model('User');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// POST register
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

// POST login
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

/* GET books */
router.get('/books', function(req, res, next) {
  console.log('GET all books');
	Book.find(function(err, books) {
		if(err) {return next(err); }

		res.json(books);
	})
});

/* POST book*/
router.post('/books', auth, function(req, res, next) {
  console.log('POST book');
	var book = new Book(req.body);

  book.contributor = req.payload.username;

	book.save(function(err, book) {
		if(err) {return next(err); }

    console.log('saving book');
		res.json(book);
	})
});

/* GET book */
router.get('/books/:book', function(req, res) {
  console.log('GET book');
	req.book.populate('ideas', function(err, book) {
    if (err) { return next(err); }

    res.json(req.book);
  });
});


/* POST idea */
router.post('/books/:book/ideas', auth, function(req, res, next) {
  console.log('POST idea');
  var idea = new Idea(req.body);
  idea.book = req.book;
  idea.contributor = req.payload.username;


  idea.save(function(err, idea){
    if(err){ return next(err); }


    console.log('saving idea');

    req.book.ideas.push(idea);

    req.book.save(function(err, book) {
      if(err){ return next(err); }

      console.log('added idea to book');
      res.json(idea);
    });
  });
});

/* PARAM book */
router.param('book', function(req, res, next, id) {
  var query = Book.findById(id);

  query.exec(function (err, book){
    if (err) { return next(err); }
    if (!book) { return next(new Error('can\'t find book')); }

    req.book = book;
    console.log('found book', book.title);

    return next();
  });
});

/* PARAM idea */
router.param('idea', function(req, res, next, id) {
  var query = Idea.findById(id);

  query.exec(function (err, idea){
    if (err) { return next(err); }
    if (!idea) { return next(new Error('can\'t find idea')); }

    req.idea = idea;

    console.log('found idea', idea.body);
    return next();
  });
});

module.exports = router;