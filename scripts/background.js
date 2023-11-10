chrome.tabs.onUpdated.addListener((tab, tabId) => {

  if (tab && tabId && tabId.url != undefined) {

    if (tabId.url.includes("youtube.com/watch")) {
      console.log("on watch page", tabId.url);
      chrome.tabs.sendMessage(tab, { page: "watch" });
    }

    else if (tabId.url.includes("youtube.com/shorts")) {
      console.log("on short page", tabId.url);
      chrome.tabs.sendMessage(tab, { page: "shorts" });
    } 
    
    else if (tabId.url.includes("youtube.com/")) {
      console.log("main page", tabId.url);
      chrome.tabs.sendMessage(tab, { page: "home" });
    }

    else if(tabId.url.includes("instagram.com/reels")){
      console.log("instagram reels page");
      chrome.tabs.sendMessage(tab, {page:"reels"})
    }
    
  }

});
