#!/usr/bin/env python
# -*- coding: utf-8 -*-


from xml.dom import minidom
import logging

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.api import memcache
from src.models import Zone

from django.utils import simplejson


class CloudFlareAPI(webapp.RequestHandler):

    def post(self):
        logging.debug(self.request)
        ret = dict(
            result = "error",
            msg = "error",
            request = dict(
                user_email = self.request.get("user_email",""),
                user_zone = self.request.get("user_zone",""),
                act = self.request.get("act",""),
            ),
        )

        if ret["request"]["act"] == "user_create":
           ret["request"]["user_tokens"] = self.request.get("user_tokens","")
           ret["request"]["user_tos"] = self.request.get("user_tos",False)
           ret["result"]="success"
           
        #sub_plan = self.request.get("sub_plan","")
        logging.debug(ret)
        self.response.out.write(simplejson.dumps(ret))
        


class MessageAPI(webapp.RequestHandler):

    def query_for_data(self,zoneid):
        zone = Zone.get_by_id(long(zoneid))
        impl = minidom.getDOMImplementation()
        xml_doc = impl.createDocument(None, "message", None)
        root = xml_doc.firstChild
        if zone is not None and zone.message_text !=u"":
            message_text = xml_doc.createElement(u"message_text")    
            message_timestamp = xml_doc.createElement(u"message_timestamp")    
            root.appendChild(message_text)
            root.appendChild(message_timestamp)
            message_text.appendChild(xml_doc.createTextNode(zone.message_text))
            message_timestamp.appendChild(xml_doc.createTextNode(zone.message_timestamp.isoformat()))
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
                                          ('/api/cloudflare', CloudFlareAPI),
                                        ],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
