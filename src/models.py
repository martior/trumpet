#!/usr/bin/env python
# -*- coding: utf-8 -*-

from google.appengine.ext import db

class User(db.Model):
    user = db.UserProperty()


class Site(db.Model):
    netloc = db.StringProperty()
    verified = db.BooleanProperty()
    owner = db.UserProperty()
    users = db.ListProperty(db.Key)



class Message(db.Model):
    type = db.StringProperty()
    title = db.StringProperty()
    text= db.TextProperty()
    site = db.ReferenceProperty(Site)
    #expire
    

