from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext import db
import os
from google.appengine.ext.webapp import template
from src.models import AudioFile, Station
from django.utils import simplejson


class MainHandler(webapp.RequestHandler):
    def render(self, template_file, template_values = {}):
       path = os.path.join(os.path.dirname(__file__)[:-4], 'templates', template_file)
       self.response.out.write(template.render(path, template_values))

    def get(self):
        self.render("user.html")
