#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import os
import logging

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template
from django.utils import simplejson

from google.appengine.api import memcache
from datetime import datetime, timedelta

from src.models import Zone

#from datetime import datetime, timedelta,date


class Dashboard(webapp.RequestHandler):
    def render(self, template_file, template_values = {}):
        path = os.path.join(os.path.dirname(__file__)[:-4], 'templates', template_file)
        self.response.out.write(template.render(path, template_values))
    def get(self,token):
        zone = Zone.all().filter("user_token =",token).fetch(limit=1)
        if len(zone)>0:
            self.render("dashboard.html",template_values={"zone":zone[0].user_zone, "token": token, "message_text": zone[0].message_text})



    def post(self,token):
        zone = Zone.all().filter("user_token =",token).fetch(limit=1)
        if len(zone)<1:
            self.response.set_status(403)        
            self.response.out.write("Site not found")
            return
        zone = zone[0]
        zone.message_text = self.request.get('message')
        zone.message_expires  = datetime.now()+timedelta(days=7)
        zone.put()
        memcache.delete(str(zone.key().id()))
        self.response.set_status(200)  
        if zone.message_text=="":
            message = "Message deleted"
        else:
            message = "Message added"
        self.response.out.write(simplejson.dumps({"message":message,"message_text":zone.message_text}))



        

def main():
    application = webapp.WSGIApplication([
                                          ('/(.*)', Dashboard),

                                        ],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
