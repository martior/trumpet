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
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext import db
import os
import logging
from google.appengine.ext.webapp import template
from src.models import AudioFile, Station
from django.utils import simplejson

from datetime import datetime, timedelta,date


class User(webapp.RequestHandler):
    def render(self, template_file, template_values = {}):
       path = os.path.join(os.path.dirname(__file__)[:-4], 'templates', template_file)
       self.response.out.write(template.render(path, template_values))

    def get(self):
        self.render("closeiframe.html",{"id":"loginframe"})



def main():
    application = webapp.WSGIApplication([('/user', User),],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
