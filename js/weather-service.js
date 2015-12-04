(function() {
   'use strict';

   function WeatherService($http) {
      var service = {};
      service.forecast = null;
      var geoloc = null;

      service.init = function(geoposition) {
         geoloc = geoposition;
         // return $http.get('https://api.forecast.io/forecast/'+FORECAST_API_KEY+'/'+geoposition.coords.latitude+','+geoposition.coords.longitude + '?units=si').
         var url = 'https://api.forecast.io/forecast/'+FORECAST_API_KEY+'/'+geoposition.coords.latitude+','+geoposition.coords.longitude;
         console.log(url);
         return $http.jsonp(url + "?callback=JSON_CALLBACK").then(function(data) {
            console.log(data);
            return service.forecast = data;
         });
      };

      //Returns the current forecast along with high and low tempratures for the current day 
      service.currentforecast = function() {
         if(service.forecast === null){
            return null;
         }
         service.forecast.data.currently.day = moment.unix(service.forecast.data.currently.time).format('ddd')
         return service.forecast.data.currently;
      }

      service.weeklyforecast = function(){
         if(service.forecast === null){
            return null;
         }
         // Add human readable info to info
         for (var i = 0; i < service.forecast.data.daily.data.length; i++) {
            service.forecast.data.daily.data[i].day = moment.unix(service.forecast.data.daily.data[i].time).format('ddd');
         };
         return service.forecast.data.daily;
      }

      service.refreshWeather = function(){
         return service.init(geoloc);
      }
        
      return service;
   }

   angular.module('SmartMirror')
   .factory('WeatherService', WeatherService);

}());