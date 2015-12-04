# Smart Mirror
This project is inspired by https://github.com/evancohen/smart-mirror.

## Prerequisites

* Check out the code: `git clone https://github.com/stevenvo/smart-mirror`
* Rename the **config.txt** file in js folder to **config.js**
* **Setup an Nginx server** and point to the virtual server to this folder, check the folder `server-config-files` for sample config file.
* **Setup Tornado server** for python websocket server in `python` folder,  check the folder `server-config-files` for sample config file.
* **Philips Hue Service**: this is **important** for your Hue Service to work. As you might know, the mirror must be hosted on a SSL web server so that Chrome browser will persist the geolocation permission and speech recognition permission (and thus it won't repeatedly ask the user to click accept). But the Hue Service API is served from a non-SSL bridge (i.e. http://hue_bridge/api). Thus the AJAX call between secure-site to non-secure-site will be blocked as default by Chrome browser. The work around is to proxy the Hue Service request to nginx (already running SSL) so it will be SSL-call --> nginx --> non-SSL-call-to-Hue. In order to do that, you must add these directives into your nginx configuration:

```
## Under http, configure Philips Hue API Server
## you can find out the Philips bridge IP at https://www.meethue.com/api/nupnp
upstream philips  {
    server 192.168.1.136:80; 
} 


## Under server, configure this directive
location /api {
    proxy_pass http://philips;
    proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
         
    proxy_redirect off;
    proxy_buffering off;
}
```


## Usage


## TODO



## License:
MIT
