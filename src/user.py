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

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.api import users
from google.appengine.ext import db
import os
from google.appengine.ext.webapp import template
from src.models import User, Feed, AudioFileProgress
from src.feed import subscribe
from django.utils import simplejson

class UserLogin(webapp.RequestHandler):
    def render(self, template_file, template_values = {}):
       path = os.path.join(os.path.dirname(__file__)[:-4], 'templates', template_file)
       self.response.out.write(template.render(path, template_values))

    def get(self):
        self.render("closeiframe.html",{"id":"loginframe"})


class UserProgress(webapp.RequestHandler):
    def get(self):
        fileid = self.request.get("file",None)
        if fileid is not None:
            query = db.Query(AudioFileProgress)
            query.filter('user =', users.get_current_user())
            query.filter('audio_file =',fileid)
            progress = query.get()
            if progress is not None:
                self.response.out.write(progress.progress)
                return
        else:
            query = db.Query(User)
            query.filter('user =', users.get_current_user())
            user = query.get()
            if user is None:
                self.response.out.write("")
                return
            last_played = user.last_played
            if last_played is not None:
                self.response.out.write(last_played)
                return
            else:
                self.response.out.write("")
                return

    def post(self):
        fileid = self.request.get("file",None)
        if fileid is None:
            self.response.out.write("")
            return
        progress = self.request.get("progress",None)
        if progress is not None:
            query = db.Query(AudioFileProgress)
            query.filter('user =', users.get_current_user())
            query.filter('audio_file =',fileid)
            audiofile_progress = query.get()
            if audiofile_progress is None:
                audiofile_progress = AudioFileProgress()
                audiofile_progress.user =  users.get_current_user()
                audiofile_progress.audio_file = fileid
            audiofile_progress.progress = progress
            audiofile_progress.put()
        else:
            query = db.Query(User)
            query.filter('user =', users.get_current_user())
            user = query.get()
            if user is None:
                self.response.out.write("")
                return
            user.last_played = fileid
            user.put()
            


class UserFeeds(webapp.RequestHandler):
    def get(self):
        query = db.Query(User)
        query.filter('user =', users.get_current_user())
        user = query.get()
        if user is None:
            return
        feeds={}
        for feed in user.feeds:
            feed = db.get(feed)
            if feed is None:
                continue
            feeds[str(feed.key().id())]=str(feed.title)
        self.response.out.write(simplejson.dumps(feeds))

    def post(self):
        query = db.Query(User)
        query.filter('user =', users.get_current_user())
        user = query.get()
        if user is None:
            return
        feed = None
        feedid = self.request.get("feed",None)

        if feedid is not None:
            feed = Feed.get_by_id(long(feedid))
        feedurl = self.request.get("feedurl",None)
        if feed is None and feedurl is not None:
            feed = subscribe(feedurl)
        if feed is not None:
            user.feeds.append(feed.key())
            user.put()
            self.response.out.write("success")
        else:
            self.response.out.write("failure")
        


def main():
    application = webapp.WSGIApplication([('/user/feeds',UserFeeds),
                                          ('/user/progress',UserProgress),
                                          ('/user', UserLogin),],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
