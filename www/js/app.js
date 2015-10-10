// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('labfriend', ['ionic', 'firebase', 'labfriend.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('index', {
    url: '/',
    controller: 'MainCtrl',
    templateUrl: 'templates/start.html'
  })
  
  .state('item/', {
    url: '/item/:id',
    controller: 'ItemCtrl',
    templateUrl: 'templates/loan-detail.html'
  })

   $urlRouterProvider.otherwise("/");

})

.controller('MainCtrl', function($scope, $location, $ionicModal, $ionicPopup, $timeout, FirebaseService) {
    $scope.equipment = FirebaseService.equipment();
    $scope.loans = FirebaseService.loans();
    $scope.inne = true;
    $scope.activeFilter = true;
    
    $scope.returnLoanee = function(item) {
        var loanee = "";
        angular.forEach($scope.loans, function(obj) {
            if (obj.id === item.$id) loanee = obj.loanee;
        })
        return loanee;
    }
    
    $scope.show = function(type) {
        if (type) {
            $scope.inne = true;
            $scope.ute = false;
            $scope.activeFilter = true;
        } else if (!type) {
            $scope.inne = false;
            $scope.ute = true;
            $scope.activeFilter = false;
        } 
    }
    
     $scope.gotoAdd = function() {
        $scope.openModal();      
     }
     
     $scope.remove = function(item) {
       $scope.equipment.$remove(item).then(function(ref) {
          ref.key();
           console.log(ref.key() + " is removed");
           var alertPopup = $ionicPopup.alert({
             title: 'Endringer',
             template: 'Enheten er tatt bort'
           }).then(function() {
                $scope.editActive = !$scope.editActive;
           });
        }, function(error) {
          console.log("Error:", error);
        });
     }
     $scope.activeOS = undefined;
     $scope.setActiveOS = function(os) {
        if (os === 'android') $scope.activeOS = 'Android';    
        else if (os === 'ios') $scope.activeOS = 'iOS';    
        else if (os === 'windows') $scope.activeOS = 'Windows';    
        else $scope.activeOS = undefined;    
     }

     $scope.add = function(product) {
         if (product) {
             product.available = true;
             product.previousLoans = [{'name':'nothing', 'phone':1234}];
             $scope.equipment.$add(product);
             $scope.closeModal();
         }
    }
     
     $ionicModal.fromTemplateUrl('templates/modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            $scope.modal = modal;
          });
          $scope.openModal = function() {
            $scope.modal.show();
          };
          $scope.closeModal = function() {
            $scope.modal.hide();
          };
    
    $scope.return = function(item) {        
        angular.forEach($scope.loans, function(obj) {
            if (obj.id === item.$id) {
                $scope.loans.$remove(obj);
                $scope.e = $scope.equipment.$getRecord(obj.id);
                $scope.e.available = true;
                $scope.e.previousLoans.append({'name':obj.loanee, 'phone':obj.phonenumber});
                $scope.equipment.$save($scope.equipment.indexOf($scope.e));
                $scope.closeModal();
                $location.path("/");
            }
        })
 
    }
    
    $scope.returnLoanee = function(item) {
        var loanee = "";
        angular.forEach($scope.loans, function(obj) {
            if (obj.id === item.$id) loanee = obj.loanee;
        })
        return loanee;
    }
    
    $scope.dateDiff = function(fromdate, item) {
        var todate;
        
        angular.forEach($scope.loans, function(obj) {
            if (obj.id === item.$id) todate = new Date(obj.date);
        })

      var diff = fromdate - todate;		
      return Math.floor(diff/86400000);
    }

    $scope.today= new Date();     
})

.controller('ItemCtrl', function($scope, $stateParams, $location, $ionicModal, $ionicPopup, $timeout, FirebaseService) {
    $scope.equipment = FirebaseService.equipment();
    $scope.activeItem = $scope.equipment.$getRecord($stateParams.id);
    $scope.loans = FirebaseService.loans();

    $scope.showEdit = true;
    $scope.availability = function(product) {
        if (product.available) {
            $scope.showEdit = true;
            return "Ledig";
        } else {
            $scope.showEdit = false;
            return "Utlånt";
        }
    };
    
    $scope.returnLoanee = function() {
        var loanee = "";
        angular.forEach($scope.loans, function(obj) {
            if (obj.id === $scope.activeItem.$id) loanee = obj.loanee;
        })
        return loanee;
    }
    
    $scope.returnPhone = function() {
        var phone = "";
        angular.forEach($scope.loans, function(obj) {
            if (obj.id === $scope.activeItem.$id) phone = obj.phone;
        })
        return phone;
    }
    
    $scope.loan = {'device': $scope.activeItem.make + " " + $scope.activeItem.model };
      
    $scope.startLoan = function(loan) {
        $scope.activeItem.available = false;
        loan.date = new Date().toDateString();
        loan.id = $scope.activeItem.$id;
        $scope.loans.$add(loan);
        $scope.equipment.$save($scope.equipment.indexOf($scope.activeItem));
        $scope.closeModal();
        $location.path('/');
    };
    
     $ionicModal.fromTemplateUrl('templates/loan-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      });
      $scope.openModal = function() {
        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };
    
      $scope.return = function(item) {        
        angular.forEach($scope.loans, function(obj) {
            if (obj.id === item.$id) {
                $scope.loans.$remove(obj);
                $scope.e = $scope.equipment.$getRecord(obj.id);
                $scope.e.available = true;
                $scope.e.previousLoans.push({'name':obj.loanee, 'phone':obj.phonenumber, 'date':obj.date});
                $scope.equipment.$save($scope.equipment.indexOf($scope.e));
                $scope.closeModal();
                $location.path("/");
            }
        })
 
    }
      
    $scope.editActive = true;
    
    $scope.edit = function() {
        $scope.editActive = !$scope.editActive;
    }
    $scope.today = new Date();
    $scope.dateDiff = function(fromdate, item) {
        var todate;
        
        angular.forEach($scope.loans, function(obj) {
            if (obj.id === item.$id) todate = new Date(obj.date);
        })

      var diff = fromdate - todate;		
      return Math.floor(diff/86400000);
    }
    
    $scope.saveChanges = function() {
        $scope.equipment.$save($scope.equipment.indexOf($scope.activeItem));
       
       var alertPopup = $ionicPopup.alert({
         title: 'Endringer',
         template: 'Dine endringer er lagret'
       }).then(function() {
            $scope.editActive = !$scope.editActive;
       });    
    }
})  