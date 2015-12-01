(function() {
   'use strict';

   function VoiceSynthesisService(AnnyangService, $window) {
      
      var service = {};
    
      service.speak = function(msg) {
         console.log("VoiceSynthesisService - speak: " + msg);
         var u = new SpeechSynthesisUtterance();
         u.text = msg;
         u.lang = 'en-US';
         speechSynthesis.speak(u);
      };
        
      return service;
   }

   angular.module('SmartMirror')
   .factory('VoiceSynthesisService', VoiceSynthesisService);

}());