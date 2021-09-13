chrome.runtime.onMessage.addListener(function(message, sender, reply) {
  console.log("recv", message, sender);
  if (sender.id != 'kgdjdknhampiciojlpdpinjlbjbnnhjm') return;
  const fname = message[0] + ".json";
  const url = message[1];

  chrome.downloads.download({
    conflictAction: "overwrite",
    filename: fname,
    url: url,
  });
});
