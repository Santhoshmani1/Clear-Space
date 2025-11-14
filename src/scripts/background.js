const ADULT_GROUP = "__adult__";
const GET_ADULT_WEBSITES = 'getAdultWebsites'; // Action for messaging
const PORN_LIST_URL = 'https://blocklistproject.github.io/Lists/alt-version/porn-nl.txt';

let topAdultWebsites = [];

async function fetchAdultWebsites() {
	if (topAdultWebsites.length > 0) return topAdultWebsites;

	try {
		const response = await fetch(PORN_LIST_URL);
		if (!response.ok) {
			console.error('Failed to fetch adult websites list:', response.statusText);
			return [];
		}
		const text = await response.text();
		topAdultWebsites = text.split('\n').filter(line => line && !line.startsWith('#'));
		return topAdultWebsites;
	} catch (error) {
		console.error('Error fetching adult websites list:', error);
		return [];
	}
}

async function getBlockedWebsites() {
	const { websites } = await chrome.storage.local.get("websites");
	if (websites == null) {
		return [];
	}

	if (websites.includes(ADULT_GROUP)) {
		const adultSites = await fetchAdultWebsites();
		const otherSites = websites.filter(site => site !== ADULT_GROUP);
		return [...otherSites, ...adultSites];
	}

	return websites.flatMap((site) =>
		site === ADULT_GROUP ? [] : site,
	);
}

//  extract root domain from a URL
function getRootDomain(url) {
	try {
		const { hostname } = new URL(url);
		const parts = hostname.split(".");
		return parts.length > 2 ? parts.slice(-2).join(".") : hostname;
	} catch (error) {
		console.error("Invalid URL:", url);
		return null;
	}
}

// Check if the given URL is in the blocked list
async function isBlocked(url) {
	const rootDomain = getRootDomain(url);
	if (!rootDomain) return false;

	const websites = await getBlockedWebsites();
	return websites.some((website) => rootDomain.includes(website));
}

// Send page type message based on URL
function getPageType(url) {
	if (url.includes("youtube.com/watch")) return "watch";
	if (url.includes("youtube.com/shorts")) return "shorts";
	if (url.includes("youtube.com/")) return "home";
	if (url.includes("instagram.com/reels")) return "reels";
	return null;
}

//
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	const url = tab?.url;
	const pageType = getPageType(url);

	if (url) {
		console.log("Tab updated:", tabId, changeInfo, url);

		const rootDomain = getRootDomain(url);
		if (rootDomain) {
			isBlocked(url).then((blocked) => {
				if (blocked) {
					console.log("Blocked URL:", url);
					chrome.tabs.update(tabId, { url: "src/html/redirect.html" });
				} else {
					console.log("Allowed URL:", url);
				}
			});
		}
	}

	if (pageType) {
		console.log(`Navigated to ${pageType} page:`, url);
		chrome.tabs.sendMessage(tabId, { page: pageType });
	}
});

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === GET_ADULT_WEBSITES) {
		fetchAdultWebsites().then(websites => {
			sendResponse(websites);
		});
		// Return true to indicate you wish to send a response asynchronously
		return true;
	}
});
