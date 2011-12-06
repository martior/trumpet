#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging

from xml.dom import minidom
from urlparse import urlparse
#from datetime import datetime, timedelta,date

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.api import memcache

from src.models import Message, Site






class MessageAPI(webapp.RequestHandler):

    def query_for_data(self,netloc):
        site = Site.all().filter("netloc =",netloc).fetch(limit=1)
        logging.info(netloc)
        logging.info(site)
        logging.info(len(site))
        if len(site)>0:
            return Message.all().filter("site =", site[0]).fetch(limit=25)
        else:
            return []
        
    def get_data(self,netloc):
        data = memcache.get(netloc)
        if data is not None:
            return data
        else:
            data = self.query_for_data(netloc)
            memcache.add(netloc, data, 60000)
            return data
            
    def get(self):

        host = urlparse(self.request.headers.get("Referer","")).hostname
        cookies = self.request.cookies
        impl = minidom.getDOMImplementation()
        xml_doc = impl.createDocument(None, "messages", None)
        root = xml_doc.firstChild
        if host is not None:
            logging.debug("Possibly delivering %s messages to %s"%(len(self.get_data(host)),host))
            if host.startswith("www."):
                host = host[4:]
            for m in self.get_data(host):
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
