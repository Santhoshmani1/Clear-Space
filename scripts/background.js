browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab && changeInfo && changeInfo.url != undefined) {
    if (changeInfo.url.includes("youtube.com/watch")) {
      console.log("on watch page", changeInfo.url);
      browser.tabs.sendMessage(tabId, { page: "watch" });
    } else if (changeInfo.url.includes("youtube.com/shorts")) {
      console.log("on short page", changeInfo.url);
      browser.tabs.sendMessage(tabId, { page: "shorts" });
    } else if (changeInfo.url.includes("youtube.com/")) {
      console.log("main page", changeInfo.url);
      browser.tabs.sendMessage(tabId, { page: "home" });
    } else if (changeInfo.url.includes("instagram.com/reels")) {
      console.log("instagram reels page");
      browser.tabs.sendMessage(tabId, { page: "reels" });
    }
  }
});
