var app = angular.module('bookshelf' , ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		  $stateProvider

		    .state('home', {
		      	url: '/home',
		      	templateUrl: '/home.html',
		      	controller: 'MainCtrl',
		      	resolve: {
		      		bookPromise: ['books', function(books){
				    	return books.getAll();
					}]
			  	}
		    })

		    .state('books', {
			  url: '/books/{id}',
			  templateUrl: '/books.html',
			  controller: 'BooksCtrl',
			  resolve: {
			  	book: ['$stateParams', 'books', function($stateParams, books) {
			      return books.get($stateParams.id);
			    }]
			  }
			})

			.state('login', {
			  url: '/login',
			  templateUrl: '/login.html',
			  controller: 'AuthCtrl',
			  onEnter: ['$state', 'auth', function($state, auth){
			    if(auth.isLoggedIn()){
			      $state.go('home');
			    }
			  }]
			})

			.state('register', {
			  url: '/register',
			  templateUrl: '/register.html',
			  controller: 'AuthCtrl',
			  onEnter: ['$state', 'auth', function($state, auth){
			    if(auth.isLoggedIn()){
			      $state.go('home');
			    }
			  }]
			});

  	$urlRouterProvider.otherwise('home');
}]);


app.factory('auth', ['$http', '$window', function($http, $window) {
	var auth = {};

	auth.saveToken = function (token){
	  $window.localStorage['bookshelf-token'] = token;
	};

	auth.getToken = function (){
	  return $window.localStorage['bookshelf-token'];
	};

	auth.isLoggedIn = function(){
	  var token = auth.getToken();

	  if(token){
	    var payload = JSON.parse($window.atob(token.split('.')[1]));

	    return payload.exp > Date.now() / 1000;
	  } else {
	    return false;
	  }
	};

	auth.currentUser = function(){
	  if(auth.isLoggedIn()){
	    var token = auth.getToken();
	    var payload = JSON.parse($window.atob(token.split('.')[1]));

	    return payload.username;
	  }
	};

	auth.register = function(user){
	  return $http.post('/register', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};

	auth.logIn = function(user){
	  return $http.post('/login', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};

	auth.logOut = function(){
	  $window.localStorage.removeItem('bookshelf-token');
	};

	return auth;
}])

app.controller('NavCtrl', [
	'$scope',
	'auth',
	function($scope, auth){
	  $scope.isLoggedIn = auth.isLoggedIn;
	  $scope.currentUser = auth.currentUser;
	  $scope.logOut = auth.logOut;
	}]);

app.controller('MainCtrl', [
	'$scope',
	'books',
	function($scope, books){

  		$scope.books = books.books;

		$scope.addBook = function(){

			if(!$scope.title || $scope.title === '') { 
				return; 
			}

			books.create({
				title: $scope.title,
				link: $scope.link,
				author: $scope.author,
				description: $scope.description
			});

			$scope.title = '';
			$scope.link = '';
			$scope.description = '';
			$scope.author = '';
		}
	}]);

app.factory('books', ['$http', 'auth', function($http, auth) {
	var o = {
		books: []
	};

	o.getAll = function() {
    	return $http.get('/books').success(function(data){
	      angular.copy(data, o.books);
    	});

	};

	o.get = function(id) {
	  return $http.get('/books/' + id).then(function(res){
	    return res.data;
	  });
	};

	o.create = function(book) {
  		return $http.post('/books', book, {
  			headers: {Authorization: 'Bearer '+auth.getToken()}
  		}).success(function(data){
    		o.books.push(data);
  		});
	};

	o.addIdea = function(id, idea) {
	  	return $http.post('/books/' + id + '/ideas', idea, {
	  		headers: {Authorization: 'Bearer' + auth.getToken()}
	  	});
	};

	return o;
}]);

app.controller('BooksCtrl', [
	'$scope',
	'$stateParams',
	'books',
	'book',
	function($scope, $stateParams, books, book){

		$scope.book = book;

		$scope.addIdea = function(){
		  if($scope.body === '') { return; }

		books.addIdea(book._id, {
		    body: $scope.body
		  }).success(function(idea) {
		    $scope.book.ideas.push(idea);
		  });

		  $scope.body = '';
		};

}]);

app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth){
	  $scope.user = {};

	  $scope.register = function(){
	    auth.register($scope.user).error(function(error){
	      $scope.error = error;
	    }).then(function(){
	      $state.go('home');
	    });
	  };

	  $scope.logIn = function(){
	    auth.logIn($scope.user).error(function(error){
	      $scope.error = error;
	    }).then(function(){
	      $state.go('home');
	    });
  	};
}])



			/*{title: 'Book 1', author: 'Author 1', description: 'Here is a description of a book - read it!!', link: 'http://www.amazon.ca'},
			{title: 'Book 2', author: 'Author 2', description: 'Here is a description of a book - read it!!', link: 'http://www.amazon.ca'},
			{title: 'Book 3', author: 'Author 3', description: 'Here is a description of a book - read it!!', link: 'http://www.amazon.ca'},
			{title: 'Book 4', author: 'Author 4', description: 'Here is a description of a book - read it!!', link: 'http://www.amazon.ca'}
			*/

