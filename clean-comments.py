import re
import os
import json
import urllib.parse

from private import INITIALS
from private import FB_SHOW_BLACKLIST

def query_params(url):
  return urllib.parse.parse_qs(urllib.parse.urlparse(url).query)

def sanitize_html_names(comment_html, raw_names):
  for raw_name in raw_names:
    if raw_name in comment_html:
      comment_html = comment_html.replace(raw_name, sanitize_name(raw_name))
  return comment_html

def sanitize_html(comment_html, raw_names):
  comment_html = sanitize_html_names(comment_html, raw_names)
  if "https://l.facebook.com" in comment_html:
    for fb_link in re.findall('https://l[.]facebook[.]com/l[.]php[?]u=[^"]*',
                              comment_html):
      real_link, = query_params(fb_link)['u']
      comment_html = comment_html.replace(fb_link, real_link)
  for attr in ['class', 'title', 'style', 'target', 'data-hovercard']:
    comment_html = re.sub(' ' + attr + '="[^"]*"', '', comment_html)
  return comment_html

def sanitize_name(name):
  name = INITIALS.get(name, name)
  name = name.split()[0]
  return name

def comment_id(link):
  qp = query_params(link)
  raw_comment_id, = qp['comment_id']
  cid = "fb-%s" % raw_comment_id
  if 'reply_comment_id' in qp:
    raw_reply_id, = qp['reply_comment_id']
    cid += "_" + raw_reply_id
  return cid  

def clean_single(raw_comment, raw_names):
  # input format:
  #   name (needs sanitizing)
  #   link
  #   user id (don't include in output)
  #   timestamp
  #   comment html
  #
  # output format:
  #   first name / initials (cleaned name)
  #   link (unchanged)
  #   comment id (derived from link)
  #   comment_html
  #   timestamp
  #   children
  if not raw_comment:
    return ["unknown", "#", "unknown", "unknown", "-1", []]

  name, link, user_id, timestamp, comment_html = raw_comment
  if user_id in FB_SHOW_BLACKLIST:
    return ["opted out", "#", "unknown",
            "this user has requested that their comments not be shown here",
            timestamp, []]

  return [
    sanitize_name(name),
    link,
    comment_id(link),
    sanitize_html(comment_html, raw_names),
    timestamp,
    []
  ]

def clean(raw_comments):
  raw_names = set()
  for raw_comment in raw_comments:
    parent, children = raw_comment
    if parent:
      raw_names.add(parent[0])
      for child in children:
        if child:
          raw_names.add(child[0])   

  clean_comments = []
  for raw_comment in raw_comments:
    parent, children = raw_comment
    clean_parent = clean_single(parent, raw_names)
    clean_parent[-1] = [clean_single(child, raw_names) for child in children]
    clean_comments.append(clean_parent)
  return clean_comments

def start():
  for fname_in in os.listdir('fb-comment-raw'):
    slug = fname_in.split('.')[0]
    fname_out = 'fb-comment-archive/fb-%s.js' % slug
    if not os.path.exists(fname_out):
      with open('fb-comment-raw/%s' % fname_in) as inf:
        with open(fname_out, 'w') as outf:
          outf.write(json.dumps(clean(json.loads(inf.read()))))

if __name__ == "__main__":
  start()
