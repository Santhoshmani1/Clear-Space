(() => {
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    console.log(obj);
    const { page } = obj;
    console.log("on " + page + " page");
    if (page == "watch") {
      cleanWatchPage();
    } else if (page == "home") {
      cleanHomePage();
    } else if (page == "shorts") {
      blockShortsPage();
    }
  });
})();

function cleanWatchPage() {
  const secondaryShelf = document.querySelector("#related");
  if (secondaryShelf) {
    secondaryShelf.remove();
  }

  const commentShelf = document.querySelector("ytd-comments");
  if (commentShelf) {
    commentShelf.remove();
  }
}

function cleanHomePage() {
  // Todo
}

function blockShortsPage() {
  // Todo
}
