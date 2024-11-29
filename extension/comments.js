function click_and_mark(el) {
  if (el.already_clicked || !document.body.contains(el)) {
    return false;
  }
  el.click();
  el.already_clicked = true;
  return true;
}

function expand_things() {
  let expanded_any = false;
  const close_button = document.querySelector(
    'div[aria-label="Close"][role="button"]');
  if (close_button) {
    if (click_and_mark(close_button)) {
      expanded_any = close_button;
    }
  }

  for (const span of document.querySelectorAll(
    'div:only-child > div:only-child > span:only-child')) {
    if (span.textContent.trim() == "Most relevant") {
      if (click_and_mark(span)) {
        expanded_any = span;
      }
    }
  }

  for (const span of document.querySelectorAll(
    'div > span:only-child')) {
    if (span.textContent.trim() == "Oldest") {
      if (click_and_mark(span)) {
        expanded_any = span;
      }
    }
  }

  for (const span of document.querySelectorAll(
    'div > span:only-child > span:only-child')) {
    const text = span.textContent.trim();
    if (text === '1 Reply' || /^\d+ Replies$/.test(text)) {
      if (click_and_mark(span)) {
        expanded_any = span;
      }
    }
  }

  for (const span of document.querySelectorAll(
    'div > span:only-child > span:only-child')) {
    if (span.textContent.trim() === "View more replies") {
      if (click_and_mark(span)) {
        expanded_any = span;
      }
    }
  }

  for (const div of document.querySelectorAll(
    'div > div:only-child > div:only-child')) {
    if (div.textContent.trim() === "See more") {
      if (click_and_mark(div)) {
        expanded_any = div;
      }
    }
  }

  if (expanded_any) {
    window.setTimeout(expand_things, 100);
  } else {
    collect_comments();
  }
}

function get_name(comment_div) {
  for (const span of comment_div.querySelectorAll(
    'div > span > a > span:only-child > span:only-child')) {
    if (span.dir === "auto") {
      return span.textContent.trim();
    }
  }
  for (const span of comment_div.querySelectorAll(
    'div > div:only-child > span > span:only-child')) {
    if (span.dir === "auto") {
      return span.textContent.trim();
    }
  }
  return "";
}

function get_html(comment_div) {
  const htmls = [];
  for (const div of comment_div.querySelectorAll(
    'div > span > div > div')) {
    if (div.dir === "auto" &&
        div.getAttribute("style") === 'text-align: start;') {
      htmls.push(div.innerHTML);
    }
  }
  return htmls.join("\n")
}


function collect_comments() {
  const collected_comments = [];

  for (const comment_div of document.querySelectorAll("div")) {
    if ( (comment_div.ariaLabel || "").startsWith("Comment by ")) {
      const comment_html = get_html(comment_div);
      const comment_name = get_name(comment_div);

      let comment = [comment_name, null, null, null, comment_html, []];
      for (const reply_div of comment_div.parentElement.querySelectorAll("div")) {
        if ( (reply_div.ariaLabel || "").startsWith("Reply by ")) {
          const reply_html = get_html(reply_div);
          const reply_name = get_name(reply_div);

          comment[5].push([
            reply_name, null, null, null, reply_html, []]);
        }
      }
      collected_comments.push(comment);
    }
  }
  done(collected_comments);
}

function makeDataUrl(body) {
  return "data:application/json;base64," +
    btoa(unescape(encodeURIComponent(body)));
}

function done(collected_comments) {
  if (!collected_comments.length &&
      window.location.href !== "https://www.jefftk.com/test") {
    document.title = "no comments";
    return;
  }

  document.title = collected_comments.length + " comment" +
    (collected_comments.length == 1 ? "" : "s");
  var location_parts = document.location.href.split("/");
  var slug = location_parts[location_parts.length - 1];
  chrome.runtime.sendMessage(
    /* extension id not needed */ undefined,
    [slug, makeDataUrl(JSON.stringify(collected_comments))]);
}

expand_things();
