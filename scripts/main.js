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
    } else if (page == "reels") {
      blockReelsPage();
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
  if (shortsNavItem && shortsNavItem.getAttribute("aria-label") === "Shorts") {
    shortsNavItem.remove();
    console.log("removed shorts nav item successfully");
  }

  const miniShorts = document.querySelector(
    '.ytd-mini-guide-entry-renderer[title="Shorts"]'
  );
  if (miniShorts) {
    miniShorts.remove();
  }

  const banners = document.querySelectorAll(".ytd-statement-banner-renderer");
  banners.forEach((banner) => {
    banner.remove();
  });

  const dismissibleFeaturedBanner = document.querySelectorAll(".ytd-brand-video-shelf-renderer");
  dismissibleFeaturedBanner.forEach((banner) => {
    banner.remove();
  });

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const navItems = document.querySelectorAll(
        "#items>ytd-guide-entry-renderer"
      );
      if (navItems[1] && navItems[1].getAttribute("aria-label") === "Shorts") {
        navItems[1].remove(); // the shorts Item is the second in the first guide entry renderer.
        observer.disconnect();
      }

      const exploreItems = document.querySelectorAll("ytd-guide-entry-renderer");
      // remove items from index 21 to last
      // Below 21 items are related to Navigation and channel subscriptions
      // from index 21 to last are explore items and Promotional links (Not required)
      for (let i = 21; i < exploreItems.length; i++) {
        exploreItems[i].remove();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}



function blockShortsPage() {
  // Adding time interval to eliminate execution of scripting
  // before DOM is completely loaded.
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const shorts = document.querySelector(
        "#page-manager > ytd-shorts > div.navigation-container.style-scope.ytd-shorts"
      );
      if (shorts) {
        shorts.remove();
        document.location.href = "redirect.html";
        observer.disconnect();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function blockReelsPage() {
  document.location.href = "redirect.html";
}