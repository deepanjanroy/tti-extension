console.log("background loaded");
chrome.browserAction.onClicked.addListener(function(tab) {
  console.log("clicked");
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "markTimeline"});
  });
});
console.log("listener added!");
