(function(angular) {
   'use strict';   

   function MirrorCtrl(AnnyangService, VoiceSynthesisService, GeolocationService, WeatherService, MapService, HueService, $scope, $timeout, $window) {
      var _this = this;
      
      $scope.listening  = false;
      $scope.debug      = false;
      $scope.complement = "Good Day!"
      $scope.user       = {};

      $scope.colors           = ["#6ed3cf", "#9068be", "#e1e8f0", "#e62739"];
      $scope.mirror_response  = "Say something, or say 'MENU' for help...";
      
      
      /*****************************************/
      /* Default display flag for each section */
      $scope.sections = {
         display_complement   : true,
         display_time         : false,
         display_menu         : false,
         display_weather      : false,
         display_map          : false,
         display_sleep        : false,
      };      
      
      /**************************************/
      /*** Utility Functions ****/
      /**************************************/
      
      //Update the time
      var tick = function() {
         $scope.date = new Date();
         $timeout(tick, 1000 * 60);
      };
      
      var log_response = function(msg){
         $scope.mirror_response = msg;
         console.log(msg);
         VoiceSynthesisService.speak(msg);
      };
      
      var switch_sections = function(sections, state){
         for (var key in sections) {
            // console.log("switch_sections: " + key + " = " + state);
            $scope.sections[sections[key]] = state;
         }
      };
      
      var switch_all_sections_to_state_except = function(state, sections){
         for (var key in $scope.sections) {
            if (sections.indexOf(key) == -1){
               $scope.sections[key] = state;
            }            
         }
      };
      
      var invert_section = function(section_name){
         $scope.sections[section_name] = !$scope.sections[section_name];
         return $scope.sections[section_name];
      }
      
      /**************************************/
      /*** MAIN SECTIONS ****/
      /**************************************/

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


         // var defaultView = function() {
         //    console.debug("Ok, going to default view...");
         //    $scope.focus = "Say something, or say 'menu'";
         // };
         
         
         /**************************************/
         /******** TURN ON/OFF SECTIONs ********/
         /**************************************/

         /*** MENU ***/
         var show_hide_menu = function(){
            if ($scope.sections['display_sleep'] == false){
               var new_state = invert_section('display_menu');
               if (new_state == true) { // ON
                  switch_sections(['display_map', 'display_complement'], false);               
               }
               log_response('Ok, turning ' + (new_state == true?'ON':'OFF') + ' MENU');
            }            
         };
         
         /*** TIME ***/
         var show_hide_time = function(){
            if ($scope.sections['display_sleep'] == false){
               var new_state = invert_section('display_time');
               log_response('Ok, turning ' + (new_state == true?'ON':'OFF') + ' DATE/TIME');
            }
         };
         
         /*** WEATHER ***/
         var show_hide_weather = function(){
            if ($scope.sections['display_sleep'] == false){
               var new_state = invert_section('display_weather');
               log_response('Ok, turning ' + (new_state == true?'ON':'OFF') + ' WEATHER');
            }            
         };
         
         /*** MAP ***/
         var show_hide_map = function(){
            var new_state = invert_section('display_map');
            if (new_state == true) { // ON
               switch_sections(['display_menu', 'display_complement'], false);
            } else {
               switch_sections(['display_menu'], true);
            }
            log_response('Ok, turning ' + (new_state == true?'ON':'OFF') + ' MAP');
         };
         
         /*** MAP OF *location ***/
         var load_map_location = function(location){
            $scope.display_menu = false;
            $scope.map = MapService.generateMap(location);
            $scope.display_map = true;
            log_response('Ok, loading map of ' + location);
         }
         
         
         /*** SLEEP ***/
         var sleep = function(){
            console.log($scope.sections);
            if ($scope.sections['display_sleep'] == true){
               log_response('Don\'t you believe that I\'ve slept?');
            } else {               
               switch_sections(['display_sleep'], true);
               switch_all_sections_to_state_except(false, []);
               log_response('Ok, I\'ll take a nap, goodbye!');
            }
         };
         
         /*** WAKEUP ***/
         var wakeup = function(){
            
            $scope.display_sleep       = false;
            $scope.display_menu        = false;
            $scope.display_map         = false;
            $scope.display_complement  = true;
            log_response('Hello, say something, or say \'MENU\' for help...');
         };
         
         
         /*** Fun Commands ***/
         var yeswhynot = function(){
            log_response('Yes, why not?');
         };
         var thankyou = function(){
            log_response('Thank you!');
         };
         var imthemirror = function(){
            log_response('Hello, I\'m the mirror!');
         };
         
         
         /***************************************************/
         /******** ADD COMMANDS INTO ANNYANG SERVICE ********/
         /***************************************************/
         var commands = [
            {'phrase': 'MENU',               'callback_fn': show_hide_menu},
            {'phrase': 'TIME',               'callback_fn': show_hide_time},
            {'phrase': 'DATE',               'callback_fn': show_hide_time},
            {'phrase': 'WEATHER',            'callback_fn': show_hide_weather},
            {'phrase': 'MAP',                'callback_fn': show_hide_map},
            {'phrase': 'MAP of *location',   'callback_fn': load_map_location},
            
            
            {'phrase': '(Go to) sleep',      'callback_fn': sleep},
            {'phrase': 'wake up',            'callback_fn': wakeup},
            
            {'phrase': '(very) cool',        'callback_fn': thankyou},
            {'phrase': 'really',             'callback_fn': yeswhynot},
            {'phrase': 'seriously',          'callback_fn': yeswhynot},
            {'phrase': 'what is that',       'callback_fn': imthemirror},
         ];
         angular.forEach(commands, function(cmd, key){
            AnnyangService.addCommand(cmd['phrase'], cmd['callback_fn']);
         });
         
         
         
         
         
         // // 'Show (me the) :section_name'
//          AnnyangService.addCommand('Show (me the) :section_name', function(section_name) {
//             console.debug("Display section: " + section_name);
//             show_hide_section(section_name, "show");
//
//             log_response("Show section: " + section_name);
//             console.log(AnnyangService.commands);
//             // $scope.focus = "commands";
//          });
//
//          // 'Turn off (the) :section_name'
//          AnnyangService.addCommand('Turn off (the) :section_name', function(section_name) {
//             console.debug("Hide section: " + section_name);
//             show_hide_section(section_name, "hide");
//
//             log_response("Hide section: " + section_name);
//             console.log(AnnyangService.commands);
//
//             // $scope.focus = "commands";
//          });
//
//
//          // Show the menu
//          // AnnyangService.addCommand('Menu', function() {
//          //    console.debug("Here is a list of commands...");
//          //    console.log(AnnyangService.commands);
//          //    $scope.focus = "commands";
//          // });
//
//          // Go back to default view
//          AnnyangService.addCommand('(Go) home', defaultView);
//          AnnyangService.addCommand('(Go) back', defaultView);
//          AnnyangService.addCommand('Close', defaultView);
//
//
//          // Configuration - Name
//          // Change name
//          AnnyangService.addCommand('(hello) My name is *name', function(name) {
//             console.debug("Hi", name, "nice to meet you");
//             $scope.user.name = name;
//             $scope.complement = "Hello, " + name + ".";
//          });
//          // Change location
//          AnnyangService.addCommand('My location is *location', function(location) {
//             console.debug("Change location to: " + location);
//             $scope.user.location = location;
//             $scope.map = MapService.generateMap($scope.user.location);
//          });
//
//
//
//          // Hide everything and "sleep"
//          AnnyangService.addCommand('(Go to) sleep', function() {
//             console.debug("Ok, going to sleep...");
//             $scope.focus = "sleep";
//          });
//
//
//
//          // Go back to default view
//          AnnyangService.addCommand('Wake up', defaultView);
//          // AnnyangService.addCommand('Mirror', defaultView);
//
//
//
//          // For debugging
//          AnnyangService.addCommand('Debugging :state', function(state) {
//             console.debug("Boop Boop. Showing debug info: " + state + "...");
//             $scope.debug = state == "on" ? true : false;
//          });
//          // Clear log of commands
//          AnnyangService.addCommand('Clear results', function(task) {
//             console.debug("Clearing results");
//             _this.clearResults()
//          });
//
//
//
//
//          // Show map
//          AnnyangService.addCommand('Show map', function() {
//             console.debug("Going on an adventure?");
//             $scope.focus = "map";
//          });
//
//
//
//          // Show map of specific location
//          AnnyangService.addCommand('Show (me a) map of *location', function(location) {
//             console.debug("Getting map of", location);
//             $scope.map = MapService.generateMap(location);
//             $scope.focus = "map";
//          });
//
//          // Zoom in map
//          AnnyangService.addCommand('(Map) zoom in', function() {
//             console.debug("Zoooooooom!!!");
//             $scope.map = MapService.zoomIn();
//             $scope.focus = "map";
//          });
//
//          // Zoom out map
//          AnnyangService.addCommand('(Map) zoom out', function() {
//             console.debug("Moooooooooz!!!");
//             $scope.map = MapService.zoomOut();
//             $scope.focus = "map";
//          });
//
//          // Reset map
//          AnnyangService.addCommand('(Map) reset zoom', function() {
//             console.debug("Zoooommmmmzzz00000!!!");
//             $scope.map = MapService.reset();
//             $scope.focus = "map";
//          });
//
//
//          // Reload page
//          var reload_page_function = function(){
//             console.debug("reload page!!!");
//             $window.location.reload();
//          };
//          AnnyangService.addCommand('reload (page)', reload_page_function);
//          AnnyangService.addCommand('refresh (page)', reload_page_function);
         
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

