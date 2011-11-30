# -*- coding: utf-8 -*-

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext import db
from google.appengine.api import urlfetch
from src.models import Feed, AudioFile
from src import feedparser

import logging
import urllib
import base64
import datetime

from src import settings


    

def superfeed_pubsubhubbub(post_data):
    base64string = base64.encodestring('%s:%s' % (settings.SUPERFEEDR_USERNAME, settings.SUPERFEEDR_PASSWORD))[:-1]
    form_data = urllib.urlencode(post_data)
    try:
        result = urlfetch.fetch(url=settings.SUPERFEEDR_HUB,
                        payload=form_data,
                        method=urlfetch.POST,
                        headers={"Authorization": "Basic "+ base64string, 'Content-Type': 'application/x-www-form-urlencoded'})
        logging.debug(result.status_code)
        if result.status_code == 200:
            logging.debug(result)
    except:
        logging.debug("fail")


def subscribe(topic):
    logging.debug('subscribing to new feed')
    query = db.Query(Feed)
    query.filter('url =', topic)
    results = query.fetch(limit=1)
    if len(results)>0:
        logging.debug('feed allready saved')
        feed = results[0]
    else:
        feed = Feed()
        feed.url = topic
        feed.put()
    form_fields = {
        'hub.mode' : 'subscribe',
        'hub.callback' : settings.SUPERFEEDR_CALLBACK,
        'hub.topic' : topic,
        'hub.verify' : 'sync',
        'hub.verify_token' : '',
    }
    superfeed_pubsubhubbub(form_fields)
    return feed

class SubscribeHandler(webapp.RequestHandler):
    def post(self):
        subscribe(self.request.get('topic'))
        

class UnsubscribeHandler(webapp.RequestHandler):
    def get(self):
        form_fields = {
            'hub.mode' : 'unsubscribe',
            'hub.callback' : settings.SUPERFEEDR_CALLBACK,
            'hub.topic' : self.request.get('topic'),
            'hub.verify' : 'sync',
            'hub.verify_token' : '',
        }
        superfeed_pubsubhubbub(form_fields)

class CallbackHandler(webapp.RequestHandler):
    def get(self):
        logging.debug('#authenticating feed')
        challenge = self.request.get('hub.challenge')
        self.response.out.write(challenge)
    def post(self):
        logging.debug('#saving feed data')
        body = self.request.get('body',self.request.body)
        rss = feedparser.parse(body)
        if "X-Pubsubhubbub-Topic" in self.request.headers.keys():
            feedurl = self.request.headers["X-Pubsubhubbub-Topic"]
        else:
            feedurl = self.request.get('topic')
        logging.debug(feedurl)
        logging.debug(rss.entries)
        query = db.Query(Feed)
        query.filter('url =', feedurl)
        results = query.fetch(limit=1)
        if len(results)>0:
            feed = results[0]
            if "title" in rss["feed"].keys():
                feed.title= rss["feed"]["title"]
            if "link" in rss["feed"].keys():
                feed.link= rss["feed"]["link"]
            if "image" in rss["feed"].keys():
                feed.image= rss["feed"]["image"]

            feed.put()
            for entry in rss.entries:
                logging.debug('#saving entry')
                logging.debug(entry)
                for enclosure in entry.enclosures:
                    logging.debug(enclosure)
                    if enclosure.type == "audio/mpeg":
                        audiofile = AudioFile()
                        audiofile.feed = results[0]
                        audiofile.title = entry.title
                        audiofile.summary = entry.summary
                        audiofile.url = enclosure.url
                        audiofile.published = datetime.datetime(*(entry.updated_parsed[0:6]))
                        audiofile.put()
                    
            self.response.out.write("")
        else:
            logging.debug("Feed not found %s"%feedurl)


def main():
    application = webapp.WSGIApplication([('/feed/callback', CallbackHandler),
                                          ('/feed/subscribe', SubscribeHandler),
                                          ('/feed/unsubscribe', UnsubscribeHandler),],
                                         debug=True)
    util.run_wsgi_app(application)

if __name__ == '__main__':
    main()
