angular.module('labfriend.services', [])

.factory('FirebaseService', function($firebase) {
    var FIREBASE_URI = 'https://mobillaben.firebaseio.com/';
    var ref = new Firebase(FIREBASE_URI + "/utstyr");
    var loan = new Firebase(FIREBASE_URI + "/loan");
    var sync = $firebase(ref);
    var syncLoans = $firebase(loan);

    var listarray = sync.$asArray();
    var loanarray = syncLoans.$asArray();

    return {
    equipment: function() {
      return listarray;
    },
    loans: function() {
      return loanarray;
    },
    get: function(id) {
      return loanarray.$getRecord(id);
    }
  }
});