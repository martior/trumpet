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

class Station(db.Model):
    short_name = db.StringProperty()
    title = db.StringProperty()
    feeds = db.ListProperty(db.Key)
    processed = db.BooleanProperty()
    
class User(db.Model):
    user = db.UserProperty()
    short_name = db.StringProperty()
    title = db.StringProperty()
    feeds = db.ListProperty(db.Key)
