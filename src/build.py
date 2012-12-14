#!/usr/bin/python
style = ""
for line in open("stylesheets/trumpet.css"):
  style += line.replace("\n"," ").replace("\t"," ").replace("  "," ")
  
javascript = "// ###################################\n// THIS FILE IS GENERATED, DO NOT EDIT\n// ###################################\n\n"
for line in open("javascripts/trumpet.js"):
    javascript += line.replace("STYLEHERE",style)


f = open("../public/javascripts/trumpet.js",'w')
f.write(javascript)