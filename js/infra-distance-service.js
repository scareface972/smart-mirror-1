(function() {
   'use strict';

   function InfraDistanceService($window) {
      
      var service = {};
      var ws = {};
      
      // Keep all pending requests here until they get responses
      // var callback_fn;
 
      service.setup_callback = function(callback) {
         console.log("connecting to websocket: " + WEBSOCKET_URL);
         // callback_fn = callback;
         // Create our websocket object with the address to the websocket
         ws = new WebSocket(WEBSOCKET_URL);
         ws.onopen = function(){  
            console.log("Socket has been opened!");  
         };
    
         ws.onmessage = function(message) {
            // console.log("onmessage: " + message);
            callback(JSON.parse(message.data));
         };
      };
      
      service.close = function () {
         ws.close();
      }
        
      return service;
   }

   angular.module('SmartMirror')
   .factory('InfraDistanceService', InfraDistanceService);

}());