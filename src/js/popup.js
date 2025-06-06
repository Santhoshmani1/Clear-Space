document.addEventListener('DOMContentLoaded', () => {
    const readerModeSection = document.getElementById('reader-mode');
console.log('Popup script loaded');

    // Check if reader mode is enabled
    chrome.storage.sync.get(['readerModeEnabled', 'readerModeSettings'], ({ readerModeEnabled, readerModeSettings }) => {
        // Initialize values if they don't exist
        const isEnabled = readerModeEnabled !== undefined ? readerModeEnabled : false;
        const settings = readerModeSettings || {
            sites: {},
            defaultSettings: {
                fontSize: 18,
                lineHeight: 1.5,
                maxWidth: '800px',
                backgroundColor: '#f9f9f9',
                textColor: '#333333'
            }
        };

        // Create the toggle and label
        // Add event listener to toggle
        const toggle = document.getElementById('reader-mode-toggle');
        const settingsLink = document.getElementById('reader-settings-link');

        toggle.addEventListener('change', () => {
            const newState = toggle.checked;
            chrome.storage.sync.set({ readerModeEnabled: newState });

            // Show/hide settings link based on toggle state
            settingsLink.style.display = newState ? 'inline-block' : 'none';

            // Apply reader mode to current tab if enabled
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: newState ? 'enableReaderMode' : 'disableReaderMode',
                        settings: settings
                    });
                }
            });
        });
    });
});