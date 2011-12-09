#!/usr/bin/env python
# -*- coding: utf-8 -*-


from xml.dom import minidom
import logging

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.api import memcache

from src.models import Zone






class MessageAPI(webapp.RequestHandler):

    def query_for_data(self,zoneid):
        zone = Zone.get_by_id(long(zoneid))
        impl = minidom.getDOMImplementation()
        xml_doc = impl.createDocument(None, "messages", None)
        root = xml_doc.firstChild
        if zone is not None:
            message = xml_doc.createElement(u"message")    
            root.appendChild(message)
            message.appendChild(xml_doc.createTextNode(zone.message_text))
        return xml_doc.toxml("utf-8")
                
    def get_message(self,zoneid):
        data = memcache.get(zoneid)
        if data is not None:
            return data
        else:
            data = self.query_for_data(zoneid)
            memcache.add(zoneid, data, 60000)
            return data
            
    def get(self,zoneid):
        self.response.headers["Content-Type"] = "text/xml"
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.out.write(self.get_message(zoneid))


def main():
    application = webapp.WSGIApplication([
                                          ('/(.*).xml', MessageAPI),
                                        ],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
