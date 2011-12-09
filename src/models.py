#!/usr/bin/env python
# -*- coding: utf-8 -*-

from google.appengine.ext import db

class Zone(db.Model):
    user_zone = db.StringProperty()
    user_email = db.StringProperty()
    user_token = db.StringProperty()
    user_singup_date = db.DateTimeProperty()
    user_deactive_date = db.DateTimeProperty()
    active = db.BooleanProperty()
    message_text = db.StringProperty()
    message_expires = db.DateTimeProperty() 


