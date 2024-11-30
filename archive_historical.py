#!/usr/bin/env python3

import os
import json
import time
import subprocess

archive = os.path.expanduser("~/Google Drive/My Drive/comment-archive")
archive2 = os.path.expanduser(
    "~/work/2024-11-28--blog-comment-counts/comment-archive/fb/")

with open("dated_comment_services.json") as inf:
    for slug, services in sorted(json.load(inf).items(), reverse=True):
        y, m, d = slug.replace(
            "-a", "").replace(
                "-b", "").replace(
                    "a", "").replace(
                        "b", "").replace(
                            "2020-03-066", "2020-03-06").split("-")
        
        m = m.zfill(2)
        d = d.zfill(2)

        date = "%s-%s-%s" % (y, m, d)
        
        for service, token in services:
            if service != "fb":
                continue

            if token == "YmBNyhopAmZ7M8t43":
                continue
            token = token.replace("posts/", "")

            if True:
                if not token.startswith("pfbid"):
                    continue
            else:
                if token.startswith("pfbid"):
                    continue
                if date < "2019-06-27":
                    continue
                
            if (os.path.exists(os.path.join(archive, token + ".json")) or
                os.path.exists(os.path.join(archive2, token + ".json.save"))):
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
            
            time.sleep(15)
