(function(angular) {
   'use strict';   

   function MirrorCtrl(AnnyangService, hue, InfraDistanceService, VoiceSynthesisService, GeolocationService, WeatherService, MapService, $scope, $timeout, $window, $log) {
      var _this = this;
      
      $scope.listening  = false;
      $scope.debug      = false;
      $scope.complement = "Good Day!"
      $scope.user       = {};

      $scope.colors           = ["#6ed3cf", "#9068be", "#e1e8f0", "#e62739"];
      $scope.mirror_response  = "Say something, or say 'MENU' for help...";

      $scope.last_distance       = 0;
      $scope.last_distance_count = 0;
      $scope.distance            = 0;
      
      $window.odometerOptions = {
         auto: false, // Don't automatically initialize everything with class 'odometer'
         // selector: '.my-numbers', // Change the selector used to automatically find things to be animated
         // format: '(,ddd).dd', // Change how digit groups are formatted, and how many digits are shown after the decimal point
         duration: 10, // Change how long the javascript expects the CSS animation to take
         // theme: 'car', // Specify the theme (if you have more than one theme css file on the page)
         animation: 'count' // Count is a simpler animation method which just increments the value,
      };
      
      /**** Light states ****/
      $scope.lights = [];
      
      /*****************************************/
      /* Default display flag for each section */
      /*****************************************/
      $scope.sections = {
         display_complement   : true,
         display_time         : false,
         display_menu         : false,
         display_weather      : false,
         display_map          : false,
         display_sleep        : false,
         display_light        : false,
         display_infrared     : false
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
      };
      
      var extract_lights_data = function(lights){
         var mylights = [];
         angular.forEach(lights, function(light, key){
            // console.log(key);
            mylights[key] = light;
         });
         // console.log(mylights);
         return mylights;
      };    
      
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
               $scope.currentforecast = WeatherService.currentforecast();
               $scope.weeklyforecast = WeatherService.weeklyforecast();
               console.log("Current", $scope.currentforecast);
               console.log("Weekly", $scope.weeklyforecast);
               //refresh the weather every hour
               //this doesn't acutually update the UI yet
               //$timeout(WeatherService.refreshWeather, 3600000);
            });
         });
         
         
         /*****************************************/
         /******** IR DISTANCE SECTIONs ********/
         /*****************************************/
         
         if (DISTANCE_DETECTION == true) {
            InfraDistanceService.setup_callback(function(d){               
            
               if (d > MAX_DISTANCE && $scope.last_distance > MAX_DISTANCE) {
                  $scope.last_distance_count = $scope.last_distance_count + 1;
                  $scope.last_distance       = d;               
               } else if (d <= MAX_DISTANCE && $scope.last_distance <= MAX_DISTANCE) {
                  $scope.last_distance_count = $scope.last_distance_count + 1;
                  $scope.last_distance       = d;
               } else {
                  $scope.last_distance_count = 0;               
                  $scope.last_distance       = d;                                          
               }
               
               if ($scope.last_distance_count > MIN_DISTANCE_COUNT) {
                  if (d > MAX_DISTANCE && $scope.sections['display_sleep'] == false) {
                     sleep();                              
                  } else if (d <= MAX_DISTANCE && $scope.sections['display_sleep'] == true) {
                     wakeup();
                  }
               }
               
            });
         };
         
         var process_distance_events = function(d, distance_threshold, count_threshold, near_action, far_action){
            if (d > distance_threshold && $scope.last_distance > distance_threshold) {
               $scope.last_distance_count = $scope.last_distance_count + 1;
               $scope.last_distance       = d;               
            } else if (d <= distance_threshold && $scope.last_distance <= distance_threshold) {
               $scope.last_distance_count = $scope.last_distance_count + 1;
               $scope.last_distance       = d;
            } else {
               $scope.last_distance_count = 0;
               $scope.last_distance       = d;
            }
            
            console.log("d - count - count_threshold: " + d + " - " + $scope.last_distance_count + " - " + count_threshold);
         
            if ($scope.last_distance_count == count_threshold) {
               if (d > distance_threshold) {
                  far_action();
                  // far_action(1, false);
               } else if (d <= distance_threshold) {
                  // near_action(1, true);
                  near_action();
               }      
               $scope.last_distance_count = 0;
            }
         };
         
         var light_on = function(){
            var key = 1;
            if (typeof $scope.lights == 'undefined' || $scope.lights.length <= 0) {
               // console.log("0: " + $scope.lights.length);
               myHue.getLights().then(function(lights){
                  $scope.lights = extract_lights_data(lights);
                  // console.log("1: " + $scope.lights.length);
                  console.log("1: Bring light 1 ON");
                  myHue.setLightState(key, {"on": true});
                  $scope.lights[key].state.on = true;
               });
            } else {
               // console.log("2: " + $scope.lights.length);
               if ($scope.lights[key].state.on == false){
                  // console.log("Light 1 state: " + $scope.lights[0].state.on == false);
                  console.log("2: Bring light 1 ON");
                  myHue.setLightState(key, {"on": true});
                  $scope.lights[key].state.on = true;
               } else {
                  console.log("3: Light 1 already ON");
               }
            }
         };
         
         var light_off = function(){
            var key = 1;
            if (typeof $scope.lights == 'undefined' || $scope.lights.length <= 1) {
               // console.log("0: " + $scope.lights.length);
               myHue.getLights().then(function(lights){
                  $scope.lights = extract_lights_data(lights);
                  // console.log("1: " + $scope.lights.length);
                  console.log("4: Bring light 1 OFF");
                  myHue.setLightState(key, {"on": false});
                  $scope.lights[key].state.on = false;
               });
            } else {
               // console.log("2: " + $scope.lights.length);
               if ($scope.lights[key].state.on == true){
                  // console.log("Light 1 state: " + $scope.lights[key].state.on == true);
                  console.log("5: Bring light 1 OFF");
                  myHue.setLightState(key, {"on": false});         
                  $scope.lights[key].state.on = false;         
               } else {
                  console.log("6: light 1 already OFF");
               }
               
            }
         };
         
         var show_hide_infrared = function(){
            var new_state = invert_section('display_infrared');
            if (new_state == true) { // ON
               switch_all_sections_to_state_except(false, ['display_infrared']);               
               InfraDistanceService.setup_callback(function(d){
                  $scope.distance = d;
                  process_distance_events(d, MAX_DISTANCE, MIN_DISTANCE_COUNT, 
                     light_on, light_off);
               });
            } else {
               InfraDistanceService.close();
               switch_sections(['display_menu'], true);
            }
            log_response('Ok, turning ' + (new_state == true?'ON':'OFF') + ' Infra-Red Distance Sensor');
         };
         
         
         /*****************************************/
         /********** HUE LIGHT SECTIONs ***********/
         /*****************************************/
         var myHue = hue;
         myHue.setup({
            bridgeIP: HUE_LOCAL_IP,
            bridgePort: HUE_LOCAL_PORT,
            username: HUE_USERNAME
         });
         
         var get_lights = function(){            
            var new_state = invert_section('display_light');
            if (new_state == true) { // ON
               myHue.getLights().then(function(lights){
                  $scope.lights = lights;
                  // console.log($scope.lights);
               });
               switch_all_sections_to_state_except(false, ['display_light']);
               switch_sections(['display_light'], true);
               log_response('Ok, viewing lighting condition');
            } else {
               switch_all_sections_to_state_except(false, []);
               switch_sections(['display_complement'], true);
               log_response('Ok, quit viewing lighting condition');
            }
            
         };
         
         var light_refresh = function(){
            switch_sections(['display_light'], false);
            myHue.getLights().then(function(lights){
               $scope.lights = lights;
               // console.log($scope.lights);
               switch_sections(['display_light'], true);
               log_response('Ok, updating lighting condition');
            });
         };
         
         var turn_onoff_light = function(state, lightname){            
            myHue.getLights().then(function(lights){               
               $scope.lights = lights;
               angular.forEach($scope.lights, function(light, key){
                  if (light.name.toLowerCase() === lightname.toLowerCase()){
                     var light_state = (state == "on") ? true : false;
                     switch_all_sections_to_state_except(false, ['display_light']);
                     switch_sections(['display_light'], false);
                     
                     myHue.setLightState(key, {"on": light_state}).then(function(response) {
                         $scope.lights[key].state.on = light_state;
                         log_response('Ok, ' + lightname + ' is turned ' + state);
                       });
                     switch_sections(['display_light'], true);
                  }
               });
            });            
            
         }
         
         
         /**************************************/
         /******** TURN ON/OFF SECTIONs ********/
         /**************************************/

         /*** MENU ***/
         var show_hide_menu = function(){
            if ($scope.sections['display_sleep'] == false){
               var new_state = invert_section('display_menu');
               if (new_state == true) { // ON
                  switch_all_sections_to_state_except(false, ['display_menu']);
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
               switch_all_sections_to_state_except(false, ['display_map']);
               // switch_sections(['display_menu', 'display_complement'], false);
            } else {
               switch_sections(['display_menu'], true);
            }
            log_response('Ok, turning ' + (new_state == true?'ON':'OFF') + ' map');
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
               switch_all_sections_to_state_except(false, ['display_sleep']);
               log_response('Ok, I\'ll take a nap, goodbye!');
            }
         };
         
         /*** WAKEUP ***/
         var wakeup = function(){
            switch_all_sections_to_state_except(false, ['display_complement']);
            switch_sections(['display_complement'], true);
            log_response('Hello, say something, or say \'MENU\' for help...');
         };
         
         
         var reload_page_function = function(){
            log_response('Ok, refresh page now...');
            $window.location.reload();
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
            
            {'phrase': 'PROXIMITY',          'callback_fn': show_hide_infrared},

            {'phrase': 'MAP',                'callback_fn': show_hide_map},
            {'phrase': 'MAP of *location',   'callback_fn': load_map_location},
            
            {'phrase': 'light(s)',                 'callback_fn': get_lights},
            {'phrase': 'light(s) refresh',         'callback_fn': light_refresh},    
            {'phrase': 'turn :state *lightname',   'callback_fn': turn_onoff_light},
            
            
            {'phrase': '(Go to) sleep',      'callback_fn': sleep},
            {'phrase': 'wake up',            'callback_fn': wakeup},            
            {'phrase': 'refresh',            'callback_fn': reload_page_function},
            
            {'phrase': '(very) cool',        'callback_fn': thankyou},
            {'phrase': 'really',             'callback_fn': yeswhynot},
            {'phrase': 'seriously',          'callback_fn': yeswhynot},
            {'phrase': 'what is that',       'callback_fn': imthemirror},
         ];
         angular.forEach(commands, function(cmd, key){
            AnnyangService.addCommand(cmd['phrase'], cmd['callback_fn']);
         });
         
         
         
         //Track when the Annyang is listening to us
         AnnyangService.start(function(listening){
            $scope.listening = listening;
         });         
         
         // Fallback for all commands
         AnnyangService.addCommand('*allSpeach', function(allSpeech) {
            console.debug(allSpeech);
            _this.addResult(allSpeech);
         });
         
            
            
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

