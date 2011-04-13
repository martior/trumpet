#!/usr/bin/env python
# -*- coding: utf-8 -*-

from google.appengine.ext import db

# Create your models here.


class Feed(db.Model):
    url = db.StringProperty()
    title = db.StringProperty()
    
class AudioFile(db.Model):
    feed =  db.ReferenceProperty(Feed)
    title = db.StringProperty()
    type = db.StringProperty()
    url = db.StringProperty()
    published = db.DateTimeProperty()
    processed = db.BooleanProperty()

class Station(db.Model):
    short_name = db.StringProperty()
    user = db.UserProperty()
    title = db.StringProperty()
    feeds = db.ListProperty(db.Key)
    files = db.ListProperty(db.Key)
