const recommendationsDiv = document.querySelector("#suggestions");
const blockedWebsitesSection = document.querySelector("#add-website");
const addWebsiteBtn = document.querySelector("button#new-website-adder-btn");

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

// Returns the root domain address by trimming the protocol
function sanitizeWebsite(url) {
	return url.replace(/^(http\|https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
}

function isValidWebsite(url) {
	return /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(url);
}

const Storage = {
	async getRawList() {
		const { websites } = await chrome.storage.local.get({ websites: [] });
		return websites;
	},

	async getWebsites() {
		const rawList = await this.getRawList();
		return rawList.flatMap((site) =>
			site === ADULT_GROUP ? topAdultWebsites : site,
		);
	},

	async addWebsite(website) {
		const rawList = await this.getRawList();

		// Keep ADULT_GROUP as a single entry
		if (website === ADULT_GROUP) {
			if (!rawList.includes(ADULT_GROUP)) {
				rawList.push(ADULT_GROUP);
			}
		} else if (!rawList.includes(website)) {
			rawList.push(website);
		}

		await chrome.storage.local.set({ websites: rawList });
	},

	// 
	async removeWebsite(website) {
		const rawList = await this.getRawList();
		const updatedWebsites = rawList.filter((w) => w !== website);
		await chrome.storage.local.set({ websites: updatedWebsites });
	},
};

function createWebsiteElement(website, action, onClickHandler) {
	const websiteDiv = document.createElement("div");
	websiteDiv.classList.add("blockable-website");

	const imgElement = document.createElement("img");
	if (website === ADULT_GROUP) {
		imgElement.src = "../../../assets/under-18.png";
	} else {
		imgElement.src = `https://www.google.com/s2/favicons?domain=${website}`;
	}
	imgElement.alt = website;

	const label = document.createElement("label");
	label.textContent = website === ADULT_GROUP ? "Adult Websites" : website;

	const materialIconSpan = document.createElement("span");
	materialIconSpan.textContent = action;
	materialIconSpan.classList.add("material-icons");

	const textSpan = document.createElement("span");
	textSpan.textContent = action === "delete" ? "remove" : "Add";

	const button = document.createElement("button");
	button.classList.add(`${action}-website-btn`);
	button.appendChild(materialIconSpan);
	button.appendChild(textSpan);
	button.addEventListener("click", onClickHandler);

	websiteDiv.appendChild(imgElement);
	websiteDiv.appendChild(label);
	websiteDiv.appendChild(button);
	return websiteDiv;
}

async function renderBlockedWebsites() {
	const rawList = await Storage.getRawList();
	const container =
		blockedWebsitesSection.querySelector(".blocked-list") ||
		(() => {
			const newDiv = document.createElement("div");
			newDiv.className = "blocked-list";
			blockedWebsitesSection.appendChild(newDiv);
			return newDiv;
		})();

	container.innerHTML = "";

	rawList.forEach((website) => {
		const element = createWebsiteElement(website, "delete", async () => {
			await Storage.removeWebsite(website);
			renderBlockedWebsites();
			createRecommendations();
		});
		container.appendChild(element);
	});
}

async function createRecommendations() {
	const rawList = await Storage.getRawList();
	const recommended = [
		ADULT_GROUP,
		"instagram.com",
		"linkedin.com",
		"facebook.com",
		"youtube.com",
	];

	recommendationsDiv.innerHTML = "";
	recommended
		.filter((site) => !rawList.includes(site))
		.forEach((site) => {
			const element = createWebsiteElement(site, "add", async () => {
				await Storage.addWebsite(site);
				renderBlockedWebsites();
				createRecommendations();
			});
			recommendationsDiv.appendChild(element);
		});
}

async function addNewWebsite() {
	const newWebsiteInput = document.querySelector("input#new-website");
	const rawInput = newWebsiteInput?.value.trim();
	const sanitized = sanitizeWebsite(rawInput);

	if (!rawInput || !isValidWebsite(sanitized)) {
		alert("Please enter a valid website.");
		return;
	}
	
	const websites = await Storage.getWebsites();
	if (websites.includes(sanitized)) {
		alert(`This website (${sanitized}) is already in the blocklist.`);
		return;
	}

	await Storage.addWebsite(sanitized);
	newWebsiteInput.value = "";
	renderBlockedWebsites();
	createRecommendations();
}

addWebsiteBtn.addEventListener("click", addNewWebsite);

renderBlockedWebsites();
createRecommendations();
