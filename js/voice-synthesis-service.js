(function() {
   'use strict';

   function VoiceSynthesisService($window) {
      
      var service = {};
    
      service.speak = function(msg) {
         var msg = new SpeechSynthesisUtterance();
         var voices = $window.speechSynthesis.getVoices();
         msg.voice = voices[1]; // US Female Voice
         msg.voiceURI = 'native';
         // msg.volume = 1; // 0 to 1
         // msg.rate = 1; // 0.1 to 10
         // msg.pitch = 2; //0 to 2
         msg.text = msg;
         msg.lang = 'en-US';

         msg.onend = function(e) {
           console.log('Finished in ' + event.elapsedTime + ' seconds.');
         };
         speechSynthesis.speak(msg);
      };
        
      return service;
   }

   angular.module('SmartMirror')
   .factory('VoiceSynthesisService', VoiceSynthesisService);

}());