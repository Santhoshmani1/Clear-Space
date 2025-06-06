(() => {
	// Store user settings
	let userSettings = {};

	// Load settings first
	loadSettings();

	// Listen for messages from background script
	chrome.runtime.onMessage.addListener((obj, sender, response) => {
		// listening for tab switches from background.js
		// To access Youtube main page , watch page and shorts page.
		const { page } = obj;
		console.log("on " + page + " page");

		// Handle settings update messages
		if (obj.action === 'settingsUpdated') {
			userSettings = obj.settings;
			applySettings(page);
			return;
		}

		applySettings(page);
	});

	// Load user settings from storage
	function loadSettings() {
		chrome.storage.sync.get(null, (result) => {
			userSettings = result;
		});
	}

	// Apply settings based on the current page
	function applySettings(page) {
		if (page === "watch") {
			cleanWatchPage();
		} else if (page === "home") {
			cleanHomePage();
		} else if (page === "shorts") {
			blockShortsPage();
		} else if (page === "reels") {
			blockReelsPage();
		} else if (page === "twitter" || page === "x") {
			handleTwitterPage();
		} else if (page === "facebook") {
			handleFacebookPage();
		} else if (page === "linkedin") {
			handleLinkedInPage();
		} else if (page === "instagram") {
			handleInstagramPage();
		}
	}
})();

function cleanWatchPage() {
	// Load settings to check which features to block
	chrome.storage.sync.get(['ytRecommendations', 'ytComments'], (settings) => {
		// Remove recommendations if enabled
		if (settings.ytRecommendations) {
			const secondaryShelf = document.querySelector("#related");
			if (secondaryShelf) {
				secondaryShelf.remove();
				console.log("Removed recommendations sidebar");
			}
		}

		// Remove comments if enabled
		if (settings.ytComments) {
			const commentShelf = document.querySelector("ytd-comments");
			if (commentShelf) {
				commentShelf.remove();
				console.log("Removed comments section");
			}
		}
	});
}

function cleanHomePage() {
	// Load settings to check which features to block
	chrome.storage.sync.get(['ytFeed', 'ytShorts', 'ytSubscriptions'], (settings) => {
		// If feed is enabled to be blocked
		if (settings.ytFeed) {
			// Removing the tags container (chips)
			const chipsContainer = document.querySelector("#chips-wrapper");
			if (chipsContainer) {
				chipsContainer.remove();
				console.log("chipsContainer removed successfully");
			}

			// Remove main feed content
			const primaryContent = document.querySelector("ytd-rich-grid-renderer");
			if (primaryContent) {
				// Replace with a focus message instead of completely removing
				const focusMessage = document.createElement("div");
				focusMessage.className = "focus-message";
				focusMessage.style.textAlign = "center";
				focusMessage.style.padding = "100px 20px";
				focusMessage.style.fontSize = "20px";
				focusMessage.style.color = "#fff";
				focusMessage.innerHTML = `
					<h2>Feed blocked by ClearSpace</h2>
					<p>Stay focused on your goals!</p>
				`;
				primaryContent.innerHTML = '';
				primaryContent.appendChild(focusMessage);
			}

			// Remove banners and promotional content
			const banners = document.querySelectorAll(".ytd-statement-banner-renderer");
			banners.forEach((banner) => {
				banner.remove();
			});

			const dismissibleFeaturedBanner = document.querySelectorAll(
				".ytd-brand-video-shelf-renderer",
			);
			dismissibleFeaturedBanner.forEach((banner) => {
				banner.remove();
			});
		}

		// If shorts is enabled to be blocked
		if (settings.ytShorts) {
			const shortsShelfs = document.querySelectorAll("ytd-rich-shelf-renderer");
			console.log(shortsShelfs);

			if (shortsShelfs) {
				shortsShelfs.forEach((shelf) => {
					console.log(shelf);
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
				'.ytd-mini-guide-entry-renderer[title="Shorts"]',
			);
			if (miniShorts) {
				miniShorts.remove();
			}
		}

		// If subscriptions option is enabled to be blocked
		if (settings.ytSubscriptions) {
			const subscriptionsNav = document.querySelector("#endpoint[title='Subscriptions']");
			if (subscriptionsNav) {
				subscriptionsNav.remove();
				console.log("removed subscriptions nav item");
			}
		}

		// Set up a mutation observer to handle dynamically loaded elements
		const observer = new MutationObserver((mutations) => {
			mutations.forEach(() => {
				// Block shorts navigation item if it appears
				if (settings.ytShorts) {
					const navItems = document.querySelectorAll(
						"#items>ytd-guide-entry-renderer",
					);
					if (navItems[1] && navItems[1].getAttribute("aria-label") === "Shorts") {
						navItems[1].remove();
					}
				}

				// Block explore items and promotional links (Not required)
				const exploreItems = document.querySelectorAll(
					"ytd-guide-entry-renderer",
				);
				// remove items from index 21 to last
				// Below 21 items are related to Navigation and channel subscriptions
				// from index 21 to last are explore items and Promotional links
				for (let i = 21; i < exploreItems.length; i++) {
					exploreItems[i].remove();
				}
			});
		});

		observer.observe(document.body, { childList: true, subtree: true });
	});
}

function blockShortsPage() {
	// Check if shorts blocking is enabled
	chrome.storage.sync.get(['ytShorts'], (settings) => {
		if (settings.ytShorts) {
			// Adding time interval to eliminate execution of scripting
			// before DOM is completely loaded.
			const observer = new MutationObserver((mutations) => {
				mutations.forEach(() => {
					const shorts = document.querySelector(
						"#page-manager > ytd-shorts > div.navigation-container.style-scope.ytd-shorts",
					);
					if (shorts) {
						shorts.remove();
						document.location.href = "/404";
						observer.disconnect();
					}
				});
			});

			observer.observe(document.body, { childList: true, subtree: true });
		}
	});
}

function blockReelsPage() {
	// Check if reels/shorts blocking is enabled
	chrome.storage.sync.get(['igReels'], (settings) => {
		if (settings.igReels) {
			document.location.href = "src/html/redirect.html";
		}
	});
}

function handleTwitterPage() {
	chrome.storage.sync.get(['twFeed', 'twTrends', 'twNotifications', 'twMessages', 'twLists'], (settings) => {
		// Create and insert CSS based on settings
		let css = '';

		if (settings.twFeed) {
			css += `
			div[data-testid="primaryColumn"] > div > div {display: none !important;}
			div[aria-label="Timeline: Your Home Timeline"] {display: none !important;}
			`;
		}

		if (settings.twTrends) {
			css += `
			div[data-testid="sidebarColumn"] div[aria-label="Trending"] {display: none !important;}
			div[data-testid="sidebarColumn"] section[aria-label="What's happening"] {display: none !important;}
			`;
		}

		if (settings.twNotifications) {
			css += `
			a[data-testid="AppTabBar_Notifications_Link"] {display: none !important;}
			div[aria-label="Timeline: Notifications"] {display: none !important;}
			`;
		}

		if (settings.twMessages) {
			css += `
			a[data-testid="AppTabBar_DirectMessage_Link"] {display: none !important;}
			div[aria-label="Timeline: Messages"] {display: none !important;}
			`;
		}

		if (settings.twLists) {
			css += `
			a[href="/i/lists"] {display: none !important;}
			`;
		}

		if (css) {
			const style = document.createElement('style');
			style.id = 'clear-space-twitter-styles';
			style.innerHTML = css;
			document.head.appendChild(style);
		}
	});
}

function handleFacebookPage() {
	chrome.storage.sync.get(['fbFeed', 'fbGroups', 'fbMarketplace', 'fbEvents', 'fbStories', 'fbNotifications'], (settings) => {
		// Create and insert CSS based on settings
		let css = '';

		if (settings.fbFeed) {
			css += `
			div[role="main"] {display: none !important;}
			div[data-pagelet="FeedUnit"] {display: none !important;}
			`;
		}

		if (settings.fbGroups) {
			css += `
			a[href^="/groups/"] {display: none !important;}
			`;
		}

		if (settings.fbMarketplace) {
			css += `
			a[href^="/marketplace"] {display: none !important;}
			`;
		}

		if (settings.fbEvents) {
			css += `
			a[href^="/events"] {display: none !important;}
			`;
		}

		if (settings.fbStories) {
			css += `
			div[data-pagelet="Stories"] {display: none !important;}
			`;
		}

		if (settings.fbNotifications) {
			css += `
			a[href^="/notifications"] {display: none !important;}
			div[aria-label="Notifications"] {display: none !important;}
			`;
		}

		if (css) {
			const style = document.createElement('style');
			style.id = 'clear-space-facebook-styles';
			style.innerHTML = css;
			document.head.appendChild(style);
		}
	});
}

function handleLinkedInPage() {
	chrome.storage.sync.get(['liStories', 'liFeed', 'liMessaging', 'liNotifications'], (settings) => {
		// Create and insert CSS based on settings
		let css = '';

		if (settings.liStories) {
			css += `
			div.stories-container {display: none !important;}
			`;
		}

		if (settings.liFeed) {
			css += `
			div.feed-shared-update-v2 {display: none !important;}
			div.scaffold-finite-scroll__content {display: none !important;}
			`;
		}

		if (settings.liMessaging) {
			css += `
			a[href^="/messaging"] {display: none !important;}
			li.msg-overlay-list-bubble {display: none !important;}
			`;
		}

		if (settings.liNotifications) {
			css += `
			a[href^="/notifications"] {display: none !important;}
			`;
		}

		if (css) {
			const style = document.createElement('style');
			style.id = 'clear-space-linkedin-styles';
			style.innerHTML = css;
			document.head.appendChild(style);
		}
	});
}

function handleInstagramPage() {
	chrome.storage.sync.get(['igStories', 'igReels', 'igFeed', 'igExtras'], (settings) => {
		// Create and insert CSS based on settings
		let css = '';

		if (settings.igStories) {
			css += `
			div[role="menu"] section {display: none !important;}
			`;
		}

		if (settings.igReels) {
			css += `
			a[href="/reels/"] {display: none !important;}
			`;
		}

		if (settings.igFeed) {
			css += `
			article[role="presentation"] {display: none !important;}
			`;
		}

		if (settings.igExtras) {
			css += `
			a[href="/direct/inbox/"] {display: none !important;}
			a[href^="/accounts/activity"] {display: none !important;}
			div[aria-label="Notifications"] {display: none !important;}
			`;
		}

		if (css) {
			const style = document.createElement('style');
			style.id = 'clear-space-instagram-styles';
			style.innerHTML = css;
			document.head.appendChild(style);
		}
	});
}
