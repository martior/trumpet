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
from google.appengine.ext import db
from google.appengine.api import users
from google.appengine.ext.webapp import template
from django.utils import simplejson

from src.models import User, Site, Message

#from datetime import datetime, timedelta,date


class Dashboard(webapp.RequestHandler):
    def render(self, template_file, template_values = {}):
        path = os.path.join(os.path.dirname(__file__)[:-4], 'templates', template_file)
        self.response.out.write(template.render(path, template_values))
    def get(self):
        user = users.get_current_user()

        query = db.Query(User)
        query.filter('user =', user)
        results = query.fetch(limit=1)
        if len(results)<1:
            user_object = User()
            user_object.user = user
            user_object.put()
            logging.info("found user in database")
        else:
            user_object = results[0]

        
        self.render("dashboard.html",template_values={"user":user})
    def post(self,station):
        pass




class Sites(webapp.RequestHandler):
    def get(self,site=""):
        user = users.get_current_user()
        query = db.Query(Site)
        query.filter('owner =', user)

        sites={}
        for site in  query.fetch(limit=50)            :
            sites[str(site.netloc)]=str(site.verified)
        self.response.out.write(simplejson.dumps(sites))
        
    def delete(self,site):
        pass
    def post(self):
        netloc = self.request.get('netloc')
        #zzz validate netloc here
        if netloc.startswith("www."):
            netloc = netloc[4:]

        if len(netloc) < 4:
            self.response.set_status(403)        
            self.response.out.write("Hostname is too short")
            return
        
        query = Site.all()
        query.filter('netloc =',netloc)
        results = query.fetch(1)
        if len(results)<1:
            user = users.get_current_user()
            site = Site()
            site.owner = user
            site.netloc = netloc
            site.put()
            self.response.set_status(200)  
            self.response.out.write(simplejson.dumps({"message":"Site Added"}))
        else:
            self.response.set_status(403)   
            self.response.out.write("Site allready exists")     




class Messages(webapp.RequestHandler):
    def get(self,site,message=""):

        user = users.get_current_user()
        query = db.Query(Site)
        query.filter('netloc =', site)
        res = query.fetch(limit=1)
        if len(res)<1:
            self.response.set_status(404)        
            self.response.out.write("Site not found")
            return
        if query[0].owner != user:
            self.response.set_status(403)        
            self.response.out.write("You are not the owner of this site")
            return

        site = res[0]
        query = Message.all()
        query.filter('site =',site)

    
        messages={}
        for message in  query.fetch(limit=50)            :
            messages[str(message.key().id())]=str(message.title)
        self.response.out.write(simplejson.dumps(messages))





    def delete(self,site,message):

        user = users.get_current_user()
        query = db.Query(Site)
        query.filter('netloc =', site)
        res = query.fetch(limit=1)
        if len(res)<1:
            self.response.set_status(404)        
            self.response.out.write("Site not found")
            return
        if query[0].owner != user:
            self.response.set_status(403)        
            self.response.out.write("You are not the owner of this site")
            return
        site = query[0]
        query = Message.all()
        query.filter('site =',site, 'ID =', message)
        res = query.fetch(limit=1)        
        if len(res)<1:
            self.response.set_status(404)        
            self.response.out.write("Message not found")
            return
        res[0].delete()
        self.response.set_status(200)  
        self.response.out.write(simplejson.dumps({"message":"Message Deleted"}))


    def post(self,site):

        user = users.get_current_user()
        query = db.Query(Site)
        query.filter('netloc =', site)
        res = query.fetch(limit=1)
        if len(res)<1:
            self.response.set_status(404)        
            self.response.out.write("Site not found")
            return
        if query[0].owner != user:
            self.response.set_status(403)        
            self.response.out.write("You are not the owner of this site")
            return
        site = res[0]
        message_text = self.request.get('message')
        message = Message()
        message.title = message_text
        message.site = site
        message.put()
        self.response.set_status(200)  
        self.response.out.write(simplejson.dumps({"message":"Message Added"}))
        
        

def main():
    application = webapp.WSGIApplication([
                                          ('/dashboard', Dashboard),
                                          ('/dashboard/sites/(.*)/messages', Messages),
                                          ('/dashboard/sites/(.*)/messages/(.*)', Messages),
                                          ('/dashboard/sites/(.*)', Sites),
                                          ('/dashboard/sites', Sites),

                                        ],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
