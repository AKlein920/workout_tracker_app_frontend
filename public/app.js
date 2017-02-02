var app = angular.module('workoutApp', []);

app.controller('mainController', ['$http', function($http) {
  this.url = 'http://localhost:3000'
  this.signUpData = {};
  this.logInData = {};

  ///////// Function to sign up:
  this.signUp = function() {
    $http({
      method: 'POST',
      url: this.url + '/users',
      data: {user: {username: this.signUpData.username, password: this.signUpData.password}}
    }).then(function(response) {
      console.log('Signing Up');
      console.log(response.data);
      this.signUpData = {};
    }.bind(this));
  }

  ///////// Function to log in:
  this.login = function() {
    $http({
      method: 'POST',
      url: this.url + '/users/login',
      data: {user: {username: this.logInData.username, password: this.logInData.password}}
    }).then(function(response) {
      console.log(response.data);
      if (response.data.status === 401) {
        this.wrongPassword = true;
        this.message = 'Incorrect username or password'
      } else {
        this.user = response.data.user;
        localStorage.setItem('token', JSON.stringify(response.data.token));
        localStorage.setItem('userId', JSON.stringify(response.data.user.id));
        localStorage.setItem('username', response.data.user.username.toString());
        this.logInData = {};
        this.loggedIn = true;
        this.wrongPassword = false;
      }
    }.bind(this));
  }

  //////// Function to log out:
  this.logOut = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    this.loggedIn = false;
    this.user = null;
  }


}]); ///////// END mainController
