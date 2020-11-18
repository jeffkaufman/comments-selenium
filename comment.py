import os
import sys
import json
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, SessionNotCreatedException

def click(element):
  driver.execute_script("arguments[0].click()", element)

def run(driver):
  driver.implicitly_wait(60) # seconds
  comment_js = open("comments.js").read()

  working_dir = sys.argv[1]

  for slug in sys.argv[2:]:
    print(slug)

    url_base = "https://www.facebook.com/jefftk/posts/"
    if slug.startswith("fb/note/"):
      slug = slug[len("fb/note/"):]
      url_base = "https://www.facebook.com/notes/jeff-kaufman/"

    fname = "%s/%s.raw.json" % (working_dir, slug)
    if os.path.exists(fname):
      continue

    driver.get(url_base + slug)
    driver.execute_script(comment_js)
    WebDriverWait(driver, 15).until(EC.title_is("ready"))

    result = driver.execute_script("return window.COLLECTED_COMMENTS;");

    import pprint
    pprint.pprint(result)

    with open(fname, "w") as outf:
      outf.write(json.dumps(result))

    time.sleep(5)

if __name__ == "__main__":
  driver = None
  try:
    driver = webdriver.Chrome()
    run(driver)
  except SessionNotCreatedException as e:
    raise Exception("consider 'brew cask upgrade chromedriver'", e)
  finally:
    if driver:
      driver.quit()
      pass
