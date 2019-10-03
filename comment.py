import os
import sys
import json
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException

def click(element):
  driver.execute_script("arguments[0].click()", element)

def run(driver):
  driver.implicitly_wait(2) # seconds
  comment_js = open("comments.js").read()

  for slug in sys.argv[1:]:
    fname = "fb-comment-raw/%s.raw.json" % slug
    if os.path.exists(fname):
      continue

    print(slug)
    driver.get("https://www.facebook.com/jefftk/posts/" + slug)
    try:
      see_comments = driver.find_element_by_css_selector(
          "a[data-testid='UFI2CommentsCount/root']")
    except NoSuchElementException:
      result = []
    else:
      click(see_comments)
      driver.execute_script(comment_js)
      WebDriverWait(driver, 15).until(EC.title_is("ready"))
    
      result = driver.execute_script("return window.COLLECTED_COMMENTS;");

    with open(fname, "w") as outf:
      outf.write(json.dumps(result))

    time.sleep(5)

if __name__ == "__main__":
  try:
    driver = webdriver.Chrome()
    run(driver)
  finally:
    driver.quit()
    pass




