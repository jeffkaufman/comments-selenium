chrome.runtime.onMessage.addListener(function(message) {
  const fname = message[0] + ".json";
  const url = message[1];

  chrome.downloads.download({
    conflictAction: "overwrite",
    filename: fname,
    url: url,
  });
});
