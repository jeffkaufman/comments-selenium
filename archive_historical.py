#!/usr/bin/env python3

import os
import json
import time
import subprocess

archive = os.path.expanduser("~/Google Drive/My Drive/comment-archive")

with open("dated_comment_services.json") as inf:
    for slug, services in sorted(json.load(inf).items()):
        for service, token in services:
            if service != "fb":
                continue
            if not token.startswith("pfbid"):
                continue

            if os.path.exists(os.path.join(archive, token + ".json")):
                continue

            url = "https://www.facebook.com/jefftk/posts/%s" % token

            if True:
                print("%s: Would fetch %s" % (
                    slug, url))
                continue

            # First open an incognito window, and have that be the most recent
            # Chrome window you've used.
            subprocess.check_call([
                "osascript", "-e",
                """
                tell application "Google Chrome"
                activate
                set URL of tab 1 of window 1 to "%s"
                end tell
                """ % url])

            if True:
                raise Exception("breakpoint")
            
            time.sleep(10)
