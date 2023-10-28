(() => {
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    // listening for tab switches from background.js 
    // To access Youtube main page , watch page and shorts page.
    const { page } = obj;
    console.log("on " + page + " page");
    if (page == "watch") {
      cleanWatchPage();
    } else if (page == "home") {
      cleanHomePage();
    } else if (page == "shorts") {
      blockShortsPage();
    }
    cleanHomePage();
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
  // Removing the tags container, reels-shelfs
  // and shorts navigation-item from DOM

  const chipsContainer = document.querySelector("#chips-wrapper");
  if (chipsContainer) {
    chipsContainer.remove();
    console.log("chipsContainer removed successfully");
  } else {
    console.log("chipsContainer not found");
  }

  const shortsShelfs = document.querySelectorAll("ytd-rich-shelf-renderer");
  if (shortsShelfs) {
    shortsShelfs.forEach((shelf) => {
      shelf.remove();
    });
    console.log("removed shorts shelfs successfully");
  }

  const shortsNavItem = document.querySelector("#endpoint[title='Shorts']");
  if (shortsNavItem) {
    shortsNavItem.remove();
    console.log("removed shorts nav item successfully");
  }

  const miniShorts = document.querySelector(
    '.ytd-mini-guide-entry-renderer[title="Shorts"]'
  );
  if (miniShorts) {
    miniShorts.remove();
  }

  setTimeout(() => {
    const navItems = document.querySelectorAll(
      "#items>ytd-guide-entry-renderer"
    );
    console.log(navItems);
    navItems[1].remove(); // the shorts Item is the second in the first guide entry renderer.
  }, 2000);
}

setTimeout(() => {
  cleanHomePage();
  console.clear();
}, 3000);

function blockShortsPage() {
  // Adding time interval to eliminate execution of scripting
  // before DOM is completely loaded.
  setInterval(() => {
    const shorts = document.querySelector(
      "#page-manager > ytd-shorts > div.navigation-container.style-scope.ytd-shorts"
    );
    shorts.remove();
    document.location.href = "redirect.html";
  }, 1000);
}
