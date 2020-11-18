var open_comments_class_name = "_3hg- _42ft";
var view_more_class_name = "_4ssp";
var see_more_class_name = "_5v47";
var top_level_comments_class_name = "_7a9a";
var reply_comments_class_name = "_7a9h";
var comment_class_name = "_3l3x";
var author_class_name = "_6qw4";
var metadata_class_name = "_6qw7";

var close_cta = "a[id='expanding_cta_close_button']";

// As long as there are things to click on, click on them.  If there's been
// nothing to click on for 1s decide we're done.
var last_click = Date.now();
function expand_things(callback) {
  function click(x) {
    x.click();
    last_click = Date.now();
  }
  for (var x of document.getElementsByClassName(view_more_class_name)) {
    click(x);
  }
  for (var x of document.getElementsByClassName(see_more_class_name)) {
    click(x);
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

function examine_comments() {
  collected_comments = [];
  var top_level_ul =
      document.getElementsByClassName(top_level_comments_class_name)[0];
  for (var i = 0; i < top_level_ul.children.length; i++) {
    var state = "initial";

    var name = null;
    var link = null;
    var userid = null;
    var ts = null;
    var comment_html = null;

    var parent_comment = null;
    var child_comments = [];

    var nodes = [top_level_ul.children[i]];
    while (nodes.length > 0) {
      var node = nodes.pop();

      if (node.classList.contains(comment_class_name)) {
        comment_html = node.innerHTML;
      }

      if (node.classList.contains(metadata_class_name)) {
        link = node.getAttribute("href");
        if (node.children.length == 1 && node.children[0].tagName == "ABBR") {
          ts = node.children[0].getAttribute("data-utime");
        }
      }

      if (node.classList.contains(author_class_name)) {
        var data_hovercard = node.getAttribute("data-hovercard");
        if (data_hovercard) {
          var match = data_hovercard.match(
            /.*[/]user[.]php[?]id=(?<userid>[0-9]+).*$/);
          if (match && match.groups.userid) {
            userid = match.groups.userid;
          }
        }

        name = node.textContent;

        // This is assuming author_class_name is the last one we get.

        var comment = [name, link, userid, ts, comment_html];
        name = null;
        ts = null;
        comment_html = null;
        link = null;
        userid = null;

        if (parent_comment) {
          child_comments.push(comment);
        } else {
          parent_comment = comment;
        }
      }
      for (var j = 0; j < node.children.length; j++) {
        nodes.push(node.children[j]);
      }
    }
    collected_comments.push([parent_comment, child_comments]);
  }
  done(collected_comments);
}

function done(collected_comments) {
  window.COLLECTED_COMMENTS = collected_comments;
  document.title = "ready";
}

var expand_comments_potential = document.getElementsByClassName(
  open_comments_class_name);
if (expand_comments_potential.length == 1) {
  expand_comments_potential[0].click();
  expand_things(function() {
    var cta_button = document.querySelector(close_cta);
    if (cta_button) {
      cta_button.click();
    }
    examine_comments();
  });
} else {
  done([]);
}
