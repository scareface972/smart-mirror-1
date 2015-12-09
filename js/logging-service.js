(function() {
   'use strict';

   function LoggingService($window) {
      var service = {};
      
      service.init = function(geoposition) {
         var cl = {
           channel:'svo-iot-smart-mirror',
           api:'//console.re/connector.js',
           ready: function(c) {var d=document,s=d.createElement('script'),l;s.src=this.api;s.id='consolerescript';s.setAttribute('data-channel', this.channel);s.onreadystatechange=s.onload=function(){if(!l){c();}l=true;};d.getElementsByTagName('head')[0].appendChild(s);}
         };
         cl.ready(function() {
           console.re.log('Remote logging is ready.');
         });
      };
    
      service.log = function(msg) {
         console.log(msg); //local browser console
         console.re.log(msg); //remote console on http://console.re/svo-iot-smart-mirror
      };

      return service;
   }

   angular.module('SmartMirror')
   .factory('LoggingService', LoggingService);

}());