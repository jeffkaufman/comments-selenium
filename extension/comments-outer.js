var s = document.createElement('script');
s.src = chrome.runtime.getURL('comments.js');
s.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);

window.addEventListener("message", function(event) {
  console.log("recv", event.data);
  var [str, slug, collected_comments] = event.data;
  if (str !== "comments") return;

  chrome.downloads.download({
    body: JSON.stringify(collected_comments),
    conflictAction: "overwrite",
    filename: slug + ".json",
  });
});
