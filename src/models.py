#!/usr/bin/env python
# -*- coding: utf-8 -*-

from google.appengine.ext import db

#class User(db.Model):
#    user = db.UserProperty()


class Site(db.Model):
    short_name = db.StringProperty()
    title = db.StringProperty()
#    users = db.ListProperty(db.Key)



class Message(db.Model):
    type = db.StringProperty()
    title = db.StringProperty()
    text= db.TextProperty()
    #expire
    

