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
#from google.appengine.ext import db
#from google.appengine.api import users
import os
import logging
from google.appengine.ext.webapp import template
from src.models import Message

from xml.dom import minidom
#from datetime import datetime, timedelta,date




class MessageAPI(webapp.RequestHandler):
    def get(self):

        host = self.request.host
        logging.info(host)
        cookies = self.request.cookies
        impl = minidom.getDOMImplementation()
        xml_doc = impl.createDocument(None, "messages", None)
        root = xml_doc.firstChild
        for m in Message.all().fetch(limit=25):
            id = m.key().id()
            if not u"trumpet-%s"%id in cookies.keys():
                message = xml_doc.createElement(u"message")    
                key = xml_doc.createElement(u"key")
                value = xml_doc.createElement(u"value")
                root.appendChild(message)
                message.appendChild(key)
                message.appendChild(value)
                value.appendChild(xml_doc.createTextNode(unicode(m.title)))
                key.appendChild(xml_doc.createTextNode(u"%s"%id))
        self.response.headers["Content-Type"] = "text/xml"
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.out.write(xml_doc.toxml("utf-8"))


def main():
    application = webapp.WSGIApplication([
                                          ('/api/messages', MessageAPI),
                                        ],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
