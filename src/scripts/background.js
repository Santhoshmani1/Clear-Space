const ADULT_GROUP = "__adult__";

const topAdultWebsites = [
	"pornhub.com",
	"xvideos.com",
	"xnxx.com",
	"xhamster.com",
	"redtube.com",
	"youporn.com",
	"brazzers.com",
	"youjizz.com",
	"beeg.com",
	"tnaflix.com",
	"spankbang.com",
	"hclips.com",
	"efukt.com",
	"porndig.com",
	"slutload.com",
	"fantasti.cc",
	"fux.com",
	"drtuber.com",
	"motherless.com",
	"javhd.com",
	"iceporn.com",
	"pornerbros.com",
	"nuvid.com",
	"empflix.com",
	"3movs.com",
	"porn.com",
	"xtube.com",
	"mofosex.com",
	"bangbros.com",
	"yespornplease.com",
	"hqporner.com",
	"hqporner.xxx",
	"camsoda.com",
	"livejasmin.com",
	"cam4.com",
	"mydirtyhobby.com",
	"sextvx.com",
	"nudevista.com",
	"tubegalore.com",
	"tnaflix.in",
	"freudbox.com",
	"hotmovs.com",
	"extremetube.com",
	"homepornbay.com",
	"vidz.com",
	"eporner.com",
	"sheshaft.com",
	"realgfporn.com",
	"watchmygf.me",
	"privatehomeclips.com",
	"voyeurhit.com",
	"analdin.com",
	"sunporno.com",
	"pornrabbit.com",
	"xozilla.com",
	"fuxporn.com",
	"pornhd.com",
	"xxxbunker.com",
	"hdzog.com",
	"milfzr.com",
	"pornhat.com",
	"maturetubehere.com",
	"mypornmotion.com",
	"pinkrod.com",
	"pornheed.com",
	"pornoxo.com",
	"sexvid.xxx",
	"heavy-r.com",
	"myfreecams.com",
	"freecamsexposed.com",
	"leakgirls.com",
	"desixnxx.com",
	"tubepornclassic.com",
	"asiatengoku.com",
	"sxyprn.com",
	"camwhores.tv",
	"nudogram.com",
	"youav.com",
	"voyeurweb.com",
	"xnxx.tv",
	"pichunter.com",
	"milfhunter.com",
	"xossip.com",
	"onlyfans.com",
	"eroticmonkey.ch",
	"bokepindonesia.org",
	"javfor.me",
	"javcl.com",
	"javhub.net",
	"javstream.com",
	"kink.com",
	"newgrounds.com/portal/view",
	"ebonytgp.com",
	"porn300.com",
	"pornmaki.com",
	"openpornvideos.com",
	"homemoviestube.com",
	"see.xxx",
	"fucktube.com",
	"tube8.com",
];

async function getBlockedWebsites() {
	const { websites } = await chrome.storage.local.get("websites");
	if (websites == null) {
		return [];
	}
	return websites.flatMap((site) =>
		site === ADULT_GROUP ? topAdultWebsites : site,
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
