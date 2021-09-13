import glob
import os
import shutil
import json
import subprocess


from cleancomments import clean

def start():
  working_dir, *slugs = sys.argv[1:]
  for slug in slugs:
    fname_out = '%s/fb-%s.js' % (working_dir, slug)
    if not os.path.exists(fname_out):
      fname_in = '%s/%s.raw.json' % (working_dir, slug)
      if os.path.exists(fname_in):
        with open(fname_in) as inf:
          with open(fname_out, 'w') as outf:
            outf.write(json.dumps(clean(json.loads(inf.read()))))

def start():
  downloads = "/Users/jefftk/Downloads"
  archive = "/Users/jefftk/Google Drive/comment-archive"
  
  for fname in glob.glob(os.path.join(downloads, "*.json")):
    leaf = os.path.basename(fname)
    if leaf.count('.') != 1:
      continue

    slug, ext = leaf.split(".")

    if ext != "json":
      continue

    if not slug.isdigit():
      continue

    print (slug)

    shutil.copyfile(fname, os.path.join(archive, leaf))

    outname = os.path.join(archive, "fb-%s.js" % (slug))

    with open(fname) as inf:
      with open(outname, 'w') as outf:
        outf.write(json.dumps(clean(json.loads(inf.read()))))
    
    subprocess.run(["scp", outname, "ps:wsgi/fb-comment-archive/"])
                           
if __name__ == "__main__":
  start()
