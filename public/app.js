var app = angular.module('workoutApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'ui.calendar', 'ui.bootstrap.datetimepicker']);

app.config(['$routeProvider', '$locationProvider',   function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode({ enabled: true });

$routeProvider.when('/users/login', {
  templateUrl: 'partials/login.html',
  controller: 'mainController',
  controllerAs: 'main'
  }).when('/users/signup', {
    templateUrl: 'partials/signUp.html',
    controller: 'mainController',
    controllerAs: 'main'
  }).when('/users/logout', {
    redirectTo: function() {
      return '/';
    }
  });
}]);

////////////////// CALENDAR CONTROLLER ///////////////////
app.controller('CalendarCtrl', ['$http', '$uibModal', 'uiCalendarConfig', function($http, $uibModal, uiCalendarConfig) {
  this.localStorage = localStorage.length;
  this.url = 'https://workitcal-api.herokuapp.com';
  // this.url = 'http://localhost:3000';
  var url = this.url;
  this.selectedWorkout = null;
  var selectedWorkout = this.selectedWorkout;
  this.animationsEnabled = true;
  this.events = [];
  events = this.events;
  eventSources = this.eventSources;

  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();



// Function to get workout event data on page load, if user is signed in:
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

  var calendar = document.getElementById('workoutCal');

////////////////////////////////// CONFIGURE ANGULAR UI CALENDAR
  this.uiConfig = {
   calendar: {
    height: 700,
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
      // console.log(events.indexOf(selectedWorkout));
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
      // console.log(delta._days);
      // console.log(selectedWorkout.start.add(delta._days, 'days'));
      $http({
        method: 'PUT',
        url: url + '/users/' + localStorage.userId + '/workouts/' + selectedWorkout.id,
        data: {
          start: newDate
        }
      }).then(function(response) {
        console.log(response.data);
        for (var i = 0; i < events.length; i++) {
          if (selectedWorkout._id === events[i]._id) {
            events.splice(i, 1);
          }
        }
        events.push(response.data[0]);
      });
    }
   }
  };

///////////// WORK IN PROGRESS - attempt to filter events array (will not show up on calendar as filtered)
    this.getCardio = function(obj) {
      return obj.title == 'Cardio';
    }

    this.getYoga = function(obj) {
      return obj.title == 'Yoga';
    }

    this.getHIIT = function(obj) {
      return obj.title == 'HIIT';
    }

    this.getStrength = function(obj) {
      return obj.title == 'Strength Training';
    }

    this.getOther = function(obj) {
      return obj.title == 'Other';
    }

    this.eventsCardio = function() {
      this.cardioEvents = events.filter(this.getCardio);
      $('#workoutCal').fullCalendar('removeEvents');
      $('#workoutCal').fullCalendar('addEventSource', this.cardioEvents);
      // console.log(this.eventSources);
    }

    this.eventsYoga = function() {
      this.yogaEvents = events.filter(this.getYoga);
      $('#workoutCal').fullCalendar('removeEvents');
      $('#workoutCal').fullCalendar('addEventSource', this.yogaEvents);
    }

    this.eventsHIIT = function() {
      this.HIITEvents = events.filter(this.getHIIT);
      $('#workoutCal').fullCalendar('removeEvents');
      $('#workoutCal').fullCalendar('addEventSource', this.HIITEvents);
    }

    this.eventsStrength = function() {
      this.strengthEvents = events.filter(this.getStrength);
      $('#workoutCal').fullCalendar('removeEvents');
      $('#workoutCal').fullCalendar('addEventSource', this.strengthEvents);
    }

    this.eventsOther = function() {
      this.otherEvents = events.filter(this.getOther);
      $('#workoutCal').fullCalendar('removeEvents');
      $('#workoutCal').fullCalendar('addEventSource', this.otherEvents);
    }

    this.getAll = function() {
      $('#workoutCal').fullCalendar('removeEvents');
      $('#workoutCal').fullCalendar('addEventSource', this.events);
    }
}]);

///////////// ADD WORKOUT MODAL CONTROLLER ///////////////
app.controller('AddModalInstanceCtrl', ['$uibModalInstance', '$http', 'thisDate', function($uibModalInstance, $http, thisDate) {
  this.url = 'https://workitcal-api.herokuapp.com';
  // this.url = 'http://localhost:3000'
  this.workoutOptions = ['Cardio', 'HIIT', 'Strength Training', 'Yoga', 'Other'];
  this.equipment = ['Cardio machine (treadmill, elliptical, bike, etc.)', 'Weights (dumbbells, medicine ball, etc.)', 'Resistance bands/TRX straps', 'Bodyweight'];
  this.addEventData = {};
  this.events = [];
  this.thisDate = thisDate.format('MMMM Do');

  // Function to add event to calendar via modal:
    this.addEvent = function() {
      this.addEventData.start = thisDate;
      switch (this.addEventData.title) {
        case 'Cardio':
        this.addEventData.backgroundColor = '#4D528C';
        break;
        case 'HIIT':
        this.addEventData.backgroundColor = '#471A41';
        break;
        case 'Strength Training':
        this.addEventData.backgroundColor = '#578E71';
        break;
        case 'Yoga':
        this.addEventData.backgroundColor = '#61CEBB';
        break;
        case 'Other':
        this.addEventData.backgroundColor = '#ADB02B';
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
      events.push(response.data);
      this.addEventData = {};
      eventSources = [events];
      // $('#workoutCal').fullCalendar('refetchEvents');
      }.bind(this));
    };

  this.ok = function() {
    $uibModalInstance.close();
    // console.log(window.location);
    // window.location.reload();
  }

  console.log(this);
}]);

///////////////// UPDATE/DELETE WORKOUT MODAL CONTROLLER //////////////////
app.controller('ModalInstanceCtrl', ['$uibModalInstance', '$http', 'selectedWorkout', function($uibModalInstance, $http, selectedWorkout) {
  this.url = 'https://workitcal-api.herokuapp.com';
  // this.url = 'http://localhost:3000'
  this.workoutOptions = ['Cardio', 'HIIT', 'Strength Training', 'Yoga', 'Other'];
  this.equipment = ['Cardio machine (treadmill, elliptical, bike, etc.)', 'Weights (dumbbells, medicine ball, etc.)', 'Resistance bands/TRX straps', 'Bodyweight'];
  this.workout = selectedWorkout;
  this.updateWorkout = {};

  this.update = function() {
    for (var i = 0; i < events.length; i++) {
      if (selectedWorkout._id === events[i]._id) {
        events.splice(i, 1);
      }
    };
    switch (this.updateWorkout.title) {
      case 'Cardio':
      this.updateWorkout.backgroundColor = '#4D528C';
      break;
      case 'HIIT':
      this.updateWorkout.backgroundColor = '#471A41';
      break;
      case 'Strength Training':
      this.updateWorkout.backgroundColor = '#578E71';
      break;
      case 'Yoga':
      this.updateWorkout.backgroundColor = '#61CEBB';
      break;
      case 'Other':
      this.updateWorkout.backgroundColor = '#ADB02B';
      break;
  };

    $http({
      method: 'PUT',
      url: this.url + '/users/' + localStorage.userId + '/workouts/' + selectedWorkout.id,
      data: this.updateWorkout
    }).then(function(response) {
      console.log(response.data[0]);
      events.push(response.data[0]);
    });
  }

  this.delete = function() {
    for (var i = 0; i < events.length; i++) {
      if (selectedWorkout._id === events[i]._id) {
        events.splice(i, 1);
        eventSources = [events];
      }
    }
    $http({
      method: 'DELETE',
      url: this.url + '/users/' + localStorage.userId + '/workouts/' + selectedWorkout.id
    }).then(function(response) {
      console.log(response);
    });
  };

  this.ok = function() {
    // console.log(selectedWorkout);
    // console.log(this.workout);
    $uibModalInstance.close();
    // window.location.reload();
  };

}]);



////////////////// MAIN CONTROLLER ///////////////////
app.controller('mainController', ['$http', '$uibModal', '$location', function($http, $uibModal, $location) {
  this.url = 'https://workitcal-api.herokuapp.com';
  // this.url = 'http://localhost:3000';
  this.signUpData = {};
  this.logInData = {};
  this.user = {};
  this.loggedIn = false;
  this.localStorage = localStorage.length;

  if (localStorage.length) {
    this.loggedIn = true;
    this.myName = localStorage.username;
  }


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
      $location.path('/users/login');
    }.bind(this));
  }

///////// Function to log in:
  this.login = function() {
    this.myName = '';
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
        // $http({
        //   method: 'GET',
        //   url: this.url + '/users/' + localStorage.userId + '/workouts'
        // }).then(function(response) {
        //   // console.log(response.data);
        //   for (var i = 0; i < response.data.length; i++) {
        //     events.push(response.data[i]);
        //     this.loggedIn = true;
        //     this.myName = localStorage.username;
        //
        //   };
        //   // console.log(events);
        // }.bind(this));
        window.location.reload();
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
    events = [];
    window.location.reload();
    // $location.path('/');
  }

///////// Function to run on FAQ link click:
  this.faq = function() {
    var $uibModalInstance = $uibModal.open({
      // animation: this.animationsEnabled,
      templateUrl: 'faqModalContent.html',
      controller: 'faqModalInstanceCtrl',
      controllerAs: 'faq'
    });
  }

}]); ///////// END mainController

/////////////// FAQ Modal Controller
app.controller('faqModalInstanceCtrl', ['$uibModalInstance', function($uibModalInstance) {
  this.ok = function() {
    $uibModalInstance.close();
  }
}]);
