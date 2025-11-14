document.addEventListener('DOMContentLoaded', () => {
	console.log('Popup script loaded');

	const blockedFeaturesLink = document.querySelector('#blocked-features a');
	const blockedSitesLink = document.querySelector('#blocked-sites a');

	function openInNewTab(event) {
		event.preventDefault();
		const url = event.currentTarget.href;
		chrome.tabs.create({ url });
	}

	if (blockedFeaturesLink) {
		blockedFeaturesLink.addEventListener('click', openInNewTab);
	}

	if (blockedSitesLink) {
		blockedSitesLink.addEventListener('click', openInNewTab);
	}
});
