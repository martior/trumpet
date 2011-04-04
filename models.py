#!/usr/bin/env python
# -*- coding: utf-8 -*-

from google.appengine.ext import db

# Create your models here.

class Show(db.Model):
    host = db.StringProperty()
    fingerprint = db.StringProperty()
    feeds = db.ListProperty(db.ReferenceProperty(Feed))
    files = db.ListProperty(db.ReferenceProperty(AudioFile))

class Feed(db.Model):
    url = db.StringProperty()
    
class AudioFile(db.Model):
    feed =  db.ReferenceProperty(Feed)
    title = db.StringProperty()
    url = db.StringProperty()