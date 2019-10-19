#!/bin/bash

set -e
set -u

WORKING_DIR=$(date +%F)
mkdir -p $WORKING_DIR

RECENT_POST_IDS=$(cat ~/personal/backups/current/www-jefftk-com/news_raw.html \
  | grep 'Tags:.*fb/' \
  | grep -o 'fb/[0-9]*' \
  | head -n 50 \
  | sed s~fb/~~)

python comment.py $WORKING_DIR $RECENT_POST_IDS

python clean-comments.py $WORKING_DIR $RECENT_POST_IDS

scp $WORKING_DIR/fb-*.js ps:wsgi/fb-comment-archive/
