import os.path
import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import datetime
import json

from tornado.options import define, options
 
define("port", default=8888, help="run on the given port", type=int)

cl = []
            
class EchoSocketHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        if self not in cl:
            cl.append(self)
            print len(cl)
            
    def on_message(self, message):
        for c in cl:
            # c.write_message(u"" + message)
            if c != self:
                c.write_message(u"" + message)
        
    def on_close(self):
        if self in cl:
            cl.remove(self)


app = tornado.web.Application([
    (r'/voice', EchoSocketHandler),
], autoreload=True)

if __name__ == '__main__':
    server = tornado.httpserver.HTTPServer(app, ssl_options = {
        "certfile": "/usr/local/etc/nginx/ssl/nginx.crt",
        "keyfile": "/usr/local/etc/nginx/ssl/nginx.key",
    })
    server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
