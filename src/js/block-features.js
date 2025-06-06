// Immediately Invoked Function Expression (IIFE) to avoid global namespace pollution
(() => {
    // DOM elements
    const saveButton = document.getElementById('saveSettings');
    const selectAllButtons = document.querySelectorAll('.select-all-btn');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    // Initialize settings from storage
    document.addEventListener('DOMContentLoaded', () => {
        loadSavedSettings();

        // Add click event listeners to all select-all buttons
        selectAllButtons.forEach(button => {
            button.addEventListener('click', handleSelectAll);
        });

        // Add click event listener to save button
        saveButton.addEventListener('click', saveSettings);

        // Add animation for the toggle switches
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const slider = this.nextElementSibling;
                slider.classList.add('clicked');
                setTimeout(() => {
                    slider.classList.remove('clicked');
                }, 300);
            });
        });
    });

    // Load settings from Chrome storage
    function loadSavedSettings() {
        chrome.storage.sync.get(null, (result) => {
            // For each checkbox, check if there's a saved value and apply it
            checkboxes.forEach(checkbox => {
                if (result[checkbox.name] !== undefined) {
                    checkbox.checked = result[checkbox.name];
                }
            });

            // Update select all button states
            updateSelectAllButtonsState();
        });
    }

    // Handle select all button click
    function handleSelectAll(event) {
        const button = event.currentTarget;
        const sectionPrefix = button.dataset.section;
        const sectionCheckboxes = document.querySelectorAll(`input[name^="${sectionPrefix}"]`);

        // Check if all checkboxes are already checked
        const allChecked = Array.from(sectionCheckboxes).every(cb => cb.checked);

        // Toggle all checkboxes in the section
        sectionCheckboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });

        // Update button text based on new state
        updateSelectAllButtonText(button, !allChecked);
    }

    // Update the text of a select all button based on checkbox state
    function updateSelectAllButtonText(button, allChecked) {
        const textSpan = button.querySelector('span:not(.material-icons)');
        if (allChecked) {
            textSpan.textContent = 'Deselect All';
            button.querySelector('.material-icons').textContent = 'deselect';
        } else {
            textSpan.textContent = 'Select All';
            button.querySelector('.material-icons').textContent = 'select_all';
        }
    }

    // Update all select all button states based on current checkbox states
    function updateSelectAllButtonsState() {
        selectAllButtons.forEach(button => {
            const sectionPrefix = button.dataset.section;
            const sectionCheckboxes = document.querySelectorAll(`input[name^="${sectionPrefix}"]`);
            const allChecked = Array.from(sectionCheckboxes).every(cb => cb.checked);
            updateSelectAllButtonText(button, allChecked);
        });
    }    // Save settings to Chrome storage with enhanced feedback
    function saveSettings() {
        const settings = {};

        // Add saving feedback immediately
        saveButton.disabled = true;
        saveButton.classList.add('saving');
        saveButton.innerHTML = '<span class="material-icons rotating">sync</span>Saving...';

        // Add a subtle animation to all checked items
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const switchLabel = checkbox.closest('.switch-label');
                if (switchLabel) {
                    switchLabel.classList.add('pulse');
                    setTimeout(() => {
                        switchLabel.classList.remove('pulse');
                    }, 500);
                }
            }

            // Collect all checkbox states
            settings[checkbox.name] = checkbox.checked;
        });

        // Save to Chrome storage with a small delay to show animation
        setTimeout(() => {
            chrome.storage.sync.set(settings, () => {
                // Show success confirmation
                saveButton.classList.remove('saving');
                saveButton.classList.add('saved');
                saveButton.innerHTML = '<span class="material-icons">check_circle</span>Saved!';

                // Create floating success indicators
                createSuccessIndicator();

                // Revert to original state after a short delay
                setTimeout(() => {
                    saveButton.classList.remove('saved');
                    saveButton.innerHTML = '<span class="material-icons">save</span>Save Settings';
                    saveButton.disabled = false;
                }, 1500);

                // Also send a message to the background script to update content scripts
                chrome.runtime.sendMessage({ action: 'settingsUpdated', settings });
            });
        }, 600);
    }

    // Create floating success indicators
    function createSuccessIndicator() {
        // Create 3 floating success indicators
        for (let i = 0; i < 3; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'success-indicator';
            indicator.innerHTML = '<span class="material-icons">check_circle</span>';

            // Random position around the save button
            const randomX = -20 + Math.random() * 40;
            const randomY = -40 - Math.random() * 20;

            indicator.style.left = `calc(50% + ${randomX}px)`;
            indicator.style.bottom = `${randomY}px`;

            document.querySelector('.popup-container').appendChild(indicator);

            // Remove after animation completes
            setTimeout(() => {
                indicator.remove();
            }, 1500);
        }
    }
})();