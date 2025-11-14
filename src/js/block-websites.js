const recommendationsDiv = document.querySelector("#suggestions");
const blockedWebsitesSection = document.querySelector("#add-website");
const addWebsiteBtn = document.querySelector("#new-website-adder-btn");

const ADULT_GROUP = "__adult__";
const GET_ADULT_WEBSITES = 'getAdultWebsites'; // Action for messaging

async function fetchAdultWebsites() {
	// Request the list from the background script
	return chrome.runtime.sendMessage({ action: GET_ADULT_WEBSITES });
}

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

		if (rawList.includes(ADULT_GROUP)) {
			const adultSites = await fetchAdultWebsites();
			const otherSites = rawList.filter(site => site !== ADULT_GROUP);
			return [...otherSites, ...adultSites];
		}

		return rawList;
	},
	async addWebsite(website) {
		const rawList = await this.getRawList();
		if (website === ADULT_GROUP) {
			if (!rawList.includes(ADULT_GROUP)) rawList.push(ADULT_GROUP);
		} else if (!rawList.includes(website)) {
			rawList.push(website);
		}
		await chrome.storage.local.set({ websites: rawList });
	},
	async removeWebsite(website) {
		const rawList = await this.getRawList();
		const updated = rawList.filter((w) => w !== website);
		await chrome.storage.local.set({ websites: updated });
	},
};

// DOM Element Creation
function createWebsiteElement(website, action, onClickHandler) {
	const wrapper = document.createElement("div");
	wrapper.classList.add("blockable-website");

	const img = document.createElement("img");
	img.src =
		website === ADULT_GROUP
			? "../../../assets/under-18.png"
			: `https://www.google.com/s2/favicons?domain=${website}`;
	img.alt = website;

	const label = document.createElement("label");
	label.textContent = website === ADULT_GROUP ? "Adult Websites" : website;

	const button = document.createElement("button");
	button.classList.add(`${action}-website-btn`);
	button.innerHTML = `
    <span class="material-icons">${action}</span>
    <span>${action === "delete" ? "remove" : "Add"}</span>
  `;
	button.addEventListener("click", onClickHandler);

	wrapper.append(img, label, button);
	return wrapper;
}

async function renderBlockedWebsites() {
	const rawList = await Storage.getRawList();

	let container = blockedWebsitesSection.querySelector(".blocked-list");
	if (!container) {
		container = document.createElement("div");
		container.className = "blocked-list";
		blockedWebsitesSection.appendChild(container);
	}
	container.innerHTML = "";

	const fragment = document.createDocumentFragment();
	for (const website of rawList) {
		fragment.appendChild(
			createWebsiteElement(website, "delete", async () => {
				await Storage.removeWebsite(website);
				refreshUI();
			})
		);
	}
	container.appendChild(fragment);
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
	const fragment = document.createDocumentFragment();

	recommended
		.filter((site) => !rawList.includes(site))
		.forEach((site) => {
			fragment.appendChild(
				createWebsiteElement(site, "add", async () => {
					await Storage.addWebsite(site);
					refreshUI();
				})
			);
		});

	recommendationsDiv.appendChild(fragment);
}

function refreshUI() {
	renderBlockedWebsites();
	createRecommendations();
}

async function addNewWebsite() {
	const input = document.querySelector("#new-website");
	const rawInput = input?.value.trim();
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
	input.value = "";
	refreshUI();
}

addWebsiteBtn.addEventListener("click", addNewWebsite);
refreshUI();
