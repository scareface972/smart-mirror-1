(function() {
   'use strict';

   function InfraDistanceService($window) {
      
      var service = {};
      
      // Keep all pending requests here until they get responses
      var callback_fn;
      
      // Create a unique callback ID to map requests to responses
      var currentCallbackId = 0;
      
      // Create our websocket object with the address to the websocket
      var ws = {};
    
      ws.onopen = function(){  
         console.log("Socket has been opened!");  
      };
    
      ws.onmessage = function(message) {
         callback_fn(JSON.parse(message.data));
      };
    
      service.setup_callback = function(callback) {
         callback_fn = callback;
         ws = new WebSocket(WEBSOCKET_URL);
      };
        
      return service;
   }

   angular.module('SmartMirror')
   .factory('InfraDistanceService', InfraDistanceService);

}());