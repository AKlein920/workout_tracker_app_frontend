var app = angular.module('workoutApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'ui.calendar']);

app.config(['$routeProvider', '$locationProvider',    function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode({ enabled: true });

$routeProvider.when('/users/login', {
  templateUrl: 'partials/login.html',
  controller: 'mainController',
  controllerAs: 'main'
  }).when('/users/signup', {
    templateUrl: 'partials/signUp.html',
    controller: 'mainController',
    controllerAs: 'main'
  });
}]);

////////////////// CALENDAR CONTROLLER ///////////////////
app.controller('CalendarCtrl', ['$http', '$uibModal', 'uiCalendarConfig', function($http, $uibModal, uiCalendarConfig) {
  this.url = 'http://localhost:3000';
  var url = this.url;
  this.animationsEnabled = true;
  this.addEventData = {};
  this.events = [];
  this.workoutOptions = ['Cardio', 'HIIT', 'Strength Training', 'Yoga', 'Other'];

  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();

// Function to get workout event data on page load:
  $http({
    method: 'GET',
    url: this.url + '/users/' + localStorage.userId + '/workouts'
  }).then(function(response) {
    console.log(response.data);
    for (var i = 0; i < response.data.length; i++) {
      this.events.push(response.data[i]);
    };
    console.log(this.events);
    }.bind(this));

// So that fullcalendar can display events:
  this.eventSources = [this.events];

// Function to add event to calendar via form:
  this.addEvent = function() {
    switch (this.addEventData.title) {
      case 'Cardio':
      this.addEventData.backgroundColor = 'red';
      break;
      case 'HIIT':
      this.addEventData.backgroundColor = 'orange';
      break;
      case 'Strength Training':
      this.addEventData.backgroundColor = 'blue';
      break;
      case 'Yoga':
      this.addEventData.backgroundColor = 'green';
      break;
      case 'Other':
      this.addEventData.backgroundColor = 'pink';
      break;
      default:
      this.addEventData.backgroundColor = 'yellow';
  }
  $http({
    method: 'POST',
    url: this.url + '/users/' + localStorage.userId + '/workouts',
    data: this.addEventData
  }).then(function(response) {
    console.log(response.data);
    this.events.push({
      title: this.addEventData.title,
      start: this.addEventData.start,
      backgroundColor: this.addEventData.backgroundColor
    });
    this.addEventData = {};
    $('#workoutCal').fullCalendar('refetchEvents');
    }.bind(this));
  };

// Dayclick function - work on getting add form to show here
// this.dayClick = function(date, allDay, jsEvent, view) {
//   var days = document.getElementsByClassName('.fc-day');
//   console.log(days);
//   console.log('Clicked on: ' + date.format());
// };
var workouts = this.events;
this.open = function() {
  $http({
    method: 'GET',
    url: url + '/users/' + localStorage.userId + '/workouts'
  }).then(function(response) {
    console.log(response.data);
  });
  var $uibModalInstance = $uibModal.open({
    animation: this.animationsEnabled,
    templateUrl: 'myModalContent.html',
    controller: 'ModalInstanceCtrl',
    controllerAs: 'modal',
    resolve: {
      workouts: function() {

      }
    }
  });
};


  var calendar = document.getElementById('workoutCal');

  this.uiConfig = {
   calendar: {
    height: 450,
    editable: true,
    selectable: true,
    // customButtons: {
    //   addWorkoutBtn: {
    //     text: 'Add Workout',
    //     click: function() {
    //       alert('clicked the add workout button!');;
    //     }
    //   }
    // },
    header: {
      left: 'month agendaWeek agendaDay',
      center: 'title addWorkoutBtn',
      right: 'today prev,next'
    },
    eventClick: function(event, element) {

    }
   }
  };

}]);

app.controller('ModalInstanceCtrl', ['$uibModalInstance', 'workouts',  function($uibModalInstance, workouts) {
  this.workouts = workouts;
  this.ok = function() {
    $uibModalInstance.close();
  };

  this.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
}]);



////////////////// MAIN CONTROLLER ///////////////////
app.controller('mainController', ['$http', function($http) {
  this.url = 'http://localhost:3000'
  this.signUpData = {};
  this.logInData = {};
  this.user = {};

  this.myName = localStorage.username;

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
