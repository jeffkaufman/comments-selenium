#!/usr/bin/env python3

import glob
import os
import shutil
import json
import subprocess
import filecmp

from cleancomments import clean

def start():
  downloads = os.path.expanduser("~/Downloads")
  archive = os.path.expanduser("~/Google Drive/My Drive/comment-archive")
  
  for fname in glob.glob(os.path.join(downloads, "pfbid*.json")):
    leaf = os.path.basename(fname)
    if leaf.count('.') != 1:
      continue
    
    slug, ext = leaf.split(".")

    shutil.copyfile(fname, os.path.join(archive, leaf))

    outname = os.path.join(archive, "fb-%s.js" % (slug))
    outprev = outname + ".prev"
    if os.path.exists(outname):
      shutil.move(outname, outprev)

    with open(fname) as inf:
      with open(outname, 'w') as outf:
        outf.write(json.dumps(clean(json.loads(inf.read()))))

    if not os.path.exists(outprev) or not filecmp.cmp(outname, outprev):
      subprocess.run(["scp", outname, "ps:wsgi/fb-comment-archive/"])
                           
if __name__ == "__main__":
  start()
