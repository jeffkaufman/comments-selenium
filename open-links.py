#!/usr/bin/env python3

import os
import json

with open("slug_to_url.json") as inf:
    slug_to_url = json.load(inf)

with open("dated_comment_services.json") as inf:
    for slug, services in json.load(inf).items():
        for service, token in services:
            if service != "fb":
                continue
            if os.path.exists("/Users/jeffkaufman/Downloads/%s.json" % token):
                print("https://www.jefftk.com/" + slug_to_url[slug])
                
