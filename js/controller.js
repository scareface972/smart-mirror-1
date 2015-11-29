(function(angular) {
   'use strict';

   function MirrorCtrl(AnnyangService, GeolocationService, WeatherService, MapService, HueService, $scope, $timeout, $window) {
      var _this = this;
      $scope.listening = false;
      $scope.debug = false;
      $scope.complement = "Good Day!"
      $scope.focus = "Say something, or say 'menu'";
      $scope.user = {};

      $scope.colors=["#6ed3cf", "#9068be", "#e1e8f0", "#e62739"];

      //Update the time
      var tick = function() {
         $scope.date = new Date();
         $timeout(tick, 1000 * 60);
      };

      _this.init = function() {
         $scope.map = MapService.generateMap($scope.user.location);
         _this.clearResults();
         tick();

         //Get our location and then get the weather for our location
         GeolocationService.getLocation().then(function(geoposition){
            console.log("Geoposition", geoposition);
            WeatherService.init(geoposition).then(function(){
               $scope.currentForcast = WeatherService.currentForcast();
               $scope.weeklyForcast = WeatherService.weeklyForcast();
               console.log("Current", $scope.currentForcast);
               console.log("Weekly", $scope.weeklyForcast);
               //refresh the weather every hour
               //this doesn't acutually update the UI yet
               //$timeout(WeatherService.refreshWeather, 3600000);
            });
         })

         //Initiate Hue communication
         // HueService.init();

         var defaultView = function() {
            console.debug("Ok, going to default view...");
            $scope.focus = "Say something, or say 'menu'";
         }

         // Show the menu
         AnnyangService.addCommand('Menu', function() {
            console.debug("Here is a list of commands...");
            console.log(AnnyangService.commands);
            $scope.focus = "commands";
         });

         
         
         // Go back to default view
         AnnyangService.addCommand('(Go) home', defaultView);
         AnnyangService.addCommand('(Go) back', defaultView);
         AnnyangService.addCommand('Close', defaultView);
         
         
         // Configuration - Name
         // Change name
         AnnyangService.addCommand('(hello) My name is *name', function(name) {
            console.debug("Hi", name, "nice to meet you");
            $scope.user.name = name;
            $scope.complement = "Hello, " + name + ".";
         });
         // Change location
         AnnyangService.addCommand('My location is *location', function(location) {
            console.debug("Change location to: " + location);
            $scope.user.location = location;
            $scope.map = MapService.generateMap($scope.user.location);
         });
         
         

         // Hide everything and "sleep"
         AnnyangService.addCommand('(Go to) sleep', function() {
            console.debug("Ok, going to sleep...");
            $scope.focus = "sleep";
         });
         


         // Go back to default view
         AnnyangService.addCommand('Wake up', defaultView);
         AnnyangService.addCommand('Mirror', defaultView);
         
         

         // For debugging
         AnnyangService.addCommand('Debugging :state', function(state) {
            console.debug("Boop Boop. Showing debug info: " + state + "...");
            $scope.debug = state == "on" ? true : false;
         });
         // Clear log of commands
         AnnyangService.addCommand('Clear results', function(task) {
            console.debug("Clearing results");
            _this.clearResults()
         });
         
         
         

         // Show map
         AnnyangService.addCommand('Show map', function() {
            console.debug("Going on an adventure?");
            $scope.focus = "map";
         });
         
         

         // Show map of specific location
         AnnyangService.addCommand('Show (me a) map of *location', function(location) {
            console.debug("Getting map of", location);
            $scope.map = MapService.generateMap(location);
            $scope.focus = "map";
         });

         // Zoom in map
         AnnyangService.addCommand('(Map) zoom in', function() {
            console.debug("Zoooooooom!!!");
            $scope.map = MapService.zoomIn();
            $scope.focus = "map";
         });
         
         // Zoom out map
         AnnyangService.addCommand('(Map) zoom out', function() {
            console.debug("Moooooooooz!!!");
            $scope.map = MapService.zoomOut();
            $scope.focus = "map";
         });

         // Reset map
         AnnyangService.addCommand('(Map) reset zoom', function() {
            console.debug("Zoooommmmmzzz00000!!!");
            $scope.map = MapService.reset();
            $scope.focus = "map";
         });


         // Reload page
         var reload_page_function = function(){
            console.debug("reload page!!!");
            $window.location.reload();
         };
         AnnyangService.addCommand('reload (page)', reload_page_function);
         AnnyangService.addCommand('refresh (page)', reload_page_function);
         
         //Track when the Annyang is listening to us
         AnnyangService.start(function(listening){
            $scope.listening = listening;
         });         
         
         // Fallback for all commands
         AnnyangService.addCommand('*allSpeach', function(allSpeech) {
            console.debug(allSpeech);
            _this.addResult(allSpeech);
         });
         


         // Search images
         // AnnyangService.addCommand('Show me *term', function(term) {
         //    console.debug("Showing", term);
         // });



         // Set a reminder
         // AnnyangService.addCommand('Remind me to *task', function(task) {
         //    console.debug("I'll remind you to", task);
         // });

         // Clear reminders
         // AnnyangService.addCommand('Clear reminders', function() {
         //    console.debug("Clearing reminders");
         // });

         

         // Check the time
         // AnnyangService.addCommand('what time is it', function(task) {
         //    console.debug("It is", moment().format('h:mm:ss a'));
         //    _this.clearResults();
         // });

         // Turn lights off
         // AnnyangService.addCommand('(turn) (the) :state (the) light(s) *action', function(state, action) {
            //             HueService.performUpdate(state + " " + action);
            //          });

         
            
            
         };
        
         _this.addResult = function(result) {
            _this.results.push({
               content: result,
               date: new Date()
            });
         };
        
         _this.clearResults = function() {
            _this.results = [];
         };

         _this.init();
      }

      angular.module('SmartMirror')
      .controller('MirrorCtrl', MirrorCtrl);

   }(window.angular));

