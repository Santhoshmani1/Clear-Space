(() => {
    const saveButton = document.getElementById('saveSettings');
    const selectAllButtons = document.querySelectorAll('.select-all-btn');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const switchLabels = document.querySelectorAll('.switch-label');

    document.addEventListener('DOMContentLoaded', () => {
        loadSavedSettings();

        selectAllButtons.forEach(button => {
            button.addEventListener('click', handleSelectAll);
        });

        saveButton.addEventListener('click', saveSettings);

        switchLabels.forEach((label) => {
            label.addEventListener('click', (e) => handleToggle(e, label));
        });
    });

    function loadSavedSettings() {
        chrome.storage.sync.get(null, (result) => {
            checkboxes.forEach(checkbox => {
                if (result[checkbox.name] !== undefined) {
                    checkbox.checked = result[checkbox.name];
                }
            });
            updateSelectAllButtonsState();
        });
    }

    function handleSelectAll(event) {
        const button = event.currentTarget;
        const sectionPrefix = button.dataset.section;
        const sectionCheckboxes = document.querySelectorAll(`input[name^="${sectionPrefix}"]`);

        const allChecked = Array.from(sectionCheckboxes).every(cb => cb.checked);

        sectionCheckboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });

        updateSelectAllButtonText(button, !allChecked);
    }

    function handleToggle(event, label) {
        if (event.target.nodeName === 'INPUT') {
            return;
        }

        const checkbox = label.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
        }

        if (navigator.vibrate) {
            navigator.vibrate(50); 
        }

        label.classList.add('pop');
        label.addEventListener('animationend', () => label.classList.remove('pop'), { once: true });
    }

    function updateSelectAllButtonText(button, allChecked) {
        const textSpan = button.querySelector('span:not(.material-icons)');
        if (allChecked) {
            textSpan.textContent = 'Deselect All';
            button.querySelector('.material-icons').textContent = 'remove_done';
        } else {
            textSpan.textContent = 'Select All';
            button.querySelector('.material-icons').textContent = 'done_all';
        }
    }

    function updateSelectAllButtonsState() {
        selectAllButtons.forEach(button => {
            const sectionPrefix = button.dataset.section;
            const sectionCheckboxes = document.querySelectorAll(`input[name^="${sectionPrefix}"]`);
            const allChecked = Array.from(sectionCheckboxes).every(cb => cb.checked);
            updateSelectAllButtonText(button, allChecked);
        });
    }

    function saveSettings() {
        const settings = {};
        saveButton.disabled = true;
        saveButton.classList.add('saving');
        saveButton.innerHTML = '<span class="material-icons rotating">sync</span>Saving...';

        checkboxes.forEach((checkbox) => {
            settings[checkbox.name] = checkbox.checked;
        });

        setTimeout(() => {
            chrome.storage.sync.set(settings, () => {
                saveButton.classList.remove('saving');
                saveButton.classList.add('saved');
                saveButton.innerHTML = '<span class="material-icons">check_circle</span>Saved!';

                setTimeout(() => {
                    saveButton.classList.remove('saved');
                    saveButton.innerHTML = '<span class="material-icons">save</span>Save Settings';
                    saveButton.disabled = false;
                }, 1500);

                chrome.runtime.sendMessage({ action: 'settingsUpdated', settings });
            });
        }, 600);
    }
})();