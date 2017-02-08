var app = angular.module('workoutApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'ui.calendar', 'ui.bootstrap.datetimepicker']);

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
  this.selectedWorkout = null;
  var selectedWorkout = this.selectedWorkout;
  this.animationsEnabled = true;
  this.events = [];
  var events = this.events;


  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();

// Function to get workout event data on page load:
  $http({
    method: 'GET',
    url: this.url + '/users/' + localStorage.userId + '/workouts'
  }).then(function(response) {
    // console.log(response.data);
    for (var i = 0; i < response.data.length; i++) {
      this.events.push(response.data[i]);
    };
    console.log(this.events);
    }.bind(this));

// So that fullcalendar can display events:
  this.eventSources = [this.events];
  var events = this.events;

  var calendar = document.getElementById('workoutCal');

  this.uiConfig = {
   calendar: {
    height: 600,
    // theme: true,
    editable: true,
    selectable: true,
    header: {
      // left: 'month agendaWeek agendaDay',
      // center: 'title addWorkoutBtn',
      right: 'today prev,next'
    },
    views: {
      month: {
        columnFormat:'dddd'
      }
    },
    dayClick: function(date) {
      var thisDate = date;
      var $uibModalInstance = $uibModal.open({
        templateUrl: 'myAddModalContent.html',
        controller: 'AddModalInstanceCtrl',
        controllerAs: 'addModal',
        resolve: {
          thisDate: thisDate
        }
      });
      console.log(date);
      // console.log(thisDate);
    },
    eventClick: function(selectedWorkout) {
      this.selectedWorkout = selectedWorkout;
      console.log(selectedWorkout);
      var $uibModalInstance = $uibModal.open({
        // animation: this.animationsEnabled,
        templateUrl: 'myModalContent.html',
        controller: 'ModalInstanceCtrl',
        controllerAs: 'modal',
        resolve: {
          selectedWorkout: selectedWorkout
        }
      });
    },
    eventDrop: function(selectedWorkout, delta, revertFunc, jsEvent, ui, view) {
      this.selectedWorkout = selectedWorkout;
      console.log(selectedWorkout);
      console.log(selectedWorkout.start._d);
      var newDate = selectedWorkout.start._d;
      console.log(delta._days);
      // console.log(selectedWorkout.start.add(delta._days, 'days'));
      $http({
        method: 'PUT',
        url: url + '/users/' + localStorage.userId + '/workouts/' + selectedWorkout.id,
        data: {
          start: newDate
        }
      }).then(function(response) {
        console.log(response);
      })
    }
   }
  };

}]);

///////////// ADD WORKOUT MODAL CONTROLLER ///////////////
app.controller('AddModalInstanceCtrl', ['$uibModalInstance', '$http', 'thisDate', function($uibModalInstance, $http, thisDate) {
  this.url = 'http://localhost:3000';
  this.workoutOptions = ['Cardio', 'HIIT', 'Strength Training', 'Yoga', 'Other'];
  this.equipment = ['Cardio machine (treadmill, elliptical, bike, etc.)', 'Weights (dumbbells, medicine ball, etc.)', 'Resistance bands/TRX straps', 'Bodyweight'];
  this.addEventData = {};
  this.events = [];
  this.thisDate = thisDate.format();

  // Function to add event to calendar via modal:
    this.addEvent = function() {
      this.addEventData.start = thisDate;
      switch (this.addEventData.title) {
        case 'Cardio':
        this.addEventData.backgroundColor = '#FF003F';
        break;
        case 'HIIT':
        this.addEventData.backgroundColor = '#FF8109';
        break;
        case 'Strength Training':
        this.addEventData.backgroundColor = '#55384F';
        break;
        case 'Yoga':
        this.addEventData.backgroundColor = '#00E89D';
        break;
        case 'Other':
        this.addEventData.backgroundColor = '#CACDAC';
        break;
        default:
        this.addEventData.backgroundColor = 'yellow';
    };

    $http({
      method: 'POST',
      url: this.url + '/users/' + localStorage.userId + '/workouts',
      data: this.addEventData
    }).then(function(response) {
      console.log(response.data);
      // this.events.push({
      //   title: this.addEventData.title,
      //   start: this.addEventData.start,
      //   backgroundColor: this.addEventData.backgroundColor
      // });
      this.addEventData = {};
      // $('#workoutCal').fullCalendar('refetchEvents');
      }.bind(this));
    };

  this.ok = function() {
    $uibModalInstance.close();
    // console.log(window.location);
    window.location.reload();
  }

  console.log(this);
}]);

///////////////// UPDATE/DELETE WORKOUT MODAL CONTROLLER //////////////////
app.controller('ModalInstanceCtrl', ['$uibModalInstance', '$http', 'selectedWorkout', function($uibModalInstance, $http, selectedWorkout) {
  this.url = 'http://localhost:3000';
  this.workoutOptions = ['Cardio', 'HIIT', 'Strength Training', 'Yoga', 'Other'];
  this.equipment = ['Cardio machine (treadmill, elliptical, bike, etc.)', 'Weights (dumbbells, medicine ball, etc.)', 'Resistance bands/TRX straps', 'Bodyweight'];
  this.workout = selectedWorkout;
  this.updateWorkout = {};

  this.update = function() {
    switch (this.updateWorkout.title) {
      case 'Cardio':
      this.updateWorkout.backgroundColor = '#FF003F';
      break;
      case 'HIIT':
      this.updateWorkout.backgroundColor = '#FF8109';
      break;
      case 'Strength Training':
      this.updateWorkout.backgroundColor = '#55384F';
      break;
      case 'Yoga':
      this.updateWorkout.backgroundColor = '#00E89D';
      break;
      case 'Other':
      this.updateWorkout.backgroundColor = '#CACDAC';
      break;
  };
    $http({
      method: 'PUT',
      url: this.url + '/users/' + localStorage.userId + '/workouts/' + selectedWorkout.id,
      data: this.updateWorkout
    }).then(function(response) {
      console.log(response.data);
    })
  }

  this.delete = function() {
    $http({
      method: 'DELETE',
      url: this.url + '/users/' + localStorage.userId + '/workouts/' + selectedWorkout.id
    }).then(function(response) {
      console.log(response);
    })
  }

  this.ok = function() {
    // console.log(selectedWorkout);
    // console.log(this.workout);
    $uibModalInstance.close();
    window.location.reload();
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
