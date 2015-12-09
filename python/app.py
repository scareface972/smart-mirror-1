import os.path
import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import datetime


import json
import ADC0832 as ADC
import RPi.GPIO as GPIO

from tornado.options import define, options
 
define("port", default=8888, help="run on the given port", type=int)

cl = []

class SocketHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        if self not in cl:
            cl.append(self)
            tornado.ioloop.IOLoop.instance().add_timeout(datetime.timedelta(seconds=0.6), self.push_message)
            
    def on_message(self, message):
        self.write_message(u"You said: " + message)
        
    def push_message(self):
        analogVal = ADC.getResult(0)
        distance = (6762/(analogVal-9))-4
        if distance > 0:
            self.write_message(str(distance))
        tornado.ioloop.IOLoop.instance().add_timeout(datetime.timedelta(seconds=0.6), self.push_message)

    def on_close(self):
        if self in cl:
            cl.remove(self)


app = tornado.web.Application([
    # (r'/', IndexHandler),
    (r'/ws', SocketHandler),
    # (r'/api', ApiHandler),
    # (r'/(favicon.ico)', web.StaticFileHandler, {'path': '../'}),
    # (r'/(rest_api_example.png)', web.StaticFileHandler, {'path': './'}),
], autoreload=True)

if __name__ == '__main__':
    ADC.setup()
    server = tornado.httpserver.HTTPServer(app, ssl_options = {
        "certfile": "/etc/nginx/ssl/nginx.crt",
        "keyfile": "/etc/nginx/ssl/nginx.key",
    })
    server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
