var expand_selectors =
  // expand_comments
  "a[data-testid='UFI2CommentsPagerRenderer/pager_depth_0']," +
  // expand_replies
  "a[data-testid='UFI2CommentsPagerRenderer/pager_depth_1']," +
  // see more
  "div[data-testid='UFI2Comment/body'] a[role='button']";

var close_cta = "a[id='expanding_cta_close_button']";

// As long as there are things to click on, click on them.  If there's been
// nothing to click on for 1s decide we're done.
var last_click = Date.now();
function expand_things(callback) {
  for (var clickable of document.querySelectorAll(expand_selectors)) {
    clickable.click();
    last_click = Date.now();
  }
  if (last_click > (Date.now() - 1000)) {
    window.setTimeout(function() {
      expand_things(callback);
    }, 100);
  } else {
    if (callback) {
      callback();
    }
  }
}

function process_comment(comment_div) {
  var user_id = comment_div.querySelector(
       "a[data-hovercard^='/ajax/hovercard/user.php?id=']").getAttribute(
       "data-hovercard").replace("/ajax/hovercard/user.php?id=", "");
  var body_div = comment_div.querySelector(
       "div[data-testid='UFI2Comment/body'] > div");
  var actions = comment_div.querySelector(
       "ul[data-testid='UFI2CommentActionLinks/root'] > li >" +
       "a[href^='https://www.facebook.com/jefftk/posts/']");
  var abbr = actions.querySelector("abbr[data-utime]");

  try {
    var name = body_div.children[0].textContent;
    var comment_html = body_div.children[1].innerHTML;
    var ts = abbr.getAttribute("data-utime");
    var link = actions.getAttribute("href");
    return [name, link, user_id, ts, comment_html];
  } catch(e) {
    return null;
  }
}

function examine_comments() {
  collected_comments = [];
  for (var top_level_li of document.querySelectorAll(
          "div[data-testid='UFI2CommentsList/root_depth_0'] > ul > li")) {
    parent_comment = process_comment(top_level_li.querySelector(
        "div[aria-label='Comment']"));
    child_comments = [];
    for (var child_comment_div of top_level_li.querySelectorAll(
            "div[aria-label='Comment reply']")) {
      child_comments.push(process_comment(child_comment_div));
    }
    collected_comments.push([parent_comment, child_comments]);
  }
  window.COLLECTED_COMMENTS = collected_comments;
  document.title = "ready";
}

expand_things(function() {
  var cta_button = document.querySelector(close_cta);
  if (cta_button) {
    cta_button.click();
  }
  examine_comments();
});

