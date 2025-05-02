// Inject Google Translate widget
function createGoogleTranslateWidget() {
    const translateDiv = document.createElement('div');
    translateDiv.id = 'google_translate_element';

    const targetDiv = document.querySelector('.cover__header-content-title');
    if (!targetDiv || document.querySelector('#google_translate_element')) return;

    targetDiv.parentNode.insertBefore(translateDiv, targetDiv.nextSibling);

    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script1);

    window.googleTranslateElementInit = function () {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL
        }, 'google_translate_element');
    };
}

// DOM observer for inserting widget when ready
function checkForTargetElement() {
    const targetElement = document.querySelector('.cover__header-content-title');
    const buttonExists = document.querySelector('#google_translate_element');
    if (targetElement && !buttonExists) {
        createGoogleTranslateWidget();
    }
}
checkForTargetElement();
const observer = new MutationObserver(() => {
    checkForTargetElement();
});
observer.observe(document.body, { childList: true, subtree: true });

// Full reset logic for SCORM + browser
function fullyResetCourse() {
    try {
        // SCORM 2004
        if (typeof SCORM2004_CallSetValue === 'function') {
            SCORM2004_CallSetValue("cmi.suspend_data", "");
            SCORM2004_CallSetValue("cmi.exit", "normal");
            SCORM2004_CallSetValue("cmi.completion_status", "incomplete");
            SCORM2004_CallCommit();
            SCORM2004_CallTerminate();
        }
        // SCORM 1.2
        else if (typeof doLMSSetValue === 'function') {
            doLMSSetValue("cmi.suspend_data", "");
            doLMSSetValue("cmi.exit", "");
            doLMSSetValue("cmi.core.lesson_status", "incomplete");
            doLMSCommit();
            doLMSFinish();
        }
    } catch (e) {
        console.warn("SCORM reset failed:", e);
    }

    // Clear browser storage
    localStorage.clear();
    sessionStorage.clear();

    // Reload clean
    setTimeout(() => {
        window.location.href = window.location.origin + window.location.pathname;
    }, 800);
}

// Set flag on language change to trigger reset on next load
function monitorLanguageChange() {
    const interval = setInterval(() => {
        const selector = document.querySelector('.goog-te-combo');
        if (selector) {
            selector.addEventListener('change', function () {
                localStorage.setItem('selectedLang', this.value);
                localStorage.setItem('forceResetNextLoad', 'true');
                window.location.reload();
            });
            clearInterval(interval);
        }
    }, 500);
}

// Apply stored language on fresh load
function applyStoredLanguage() {
    const storedLang = localStorage.getItem('selectedLang');
    if (storedLang) {
        const tryApply = setInterval(() => {
            const selector = document.querySelector('.goog-te-combo');
            if (selector) {
                selector.value = storedLang;
                selector.dispatchEvent(new Event('change'));
                clearInterval(tryApply);
            }
        }, 500);
    }
}

// If flag is set, do full reset BEFORE Rise resumes
(function checkForceResetFlag() {
    const mustReset = localStorage.getItem('forceResetNextLoad');
    if (mustReset === 'true') {
        localStorage.removeItem('forceResetNextLoad');
        fullyResetCourse(); // Reset SCORM + storage, then reload
    }
})();

monitorLanguageChange();
applyStoredLanguage();

// Clean up Google Translate styles
const style = document.createElement('style');
style.textContent = `
    iframe[id=":1.container"] { display: none !important; }
    body {top: 0 !important;}
    .goog-logo-link {display: none !important;}
    .goog-te-gadget { color: transparent !important; }
    .VIpgJd-ZVi9od-l4eHX-hSRGPd { display: none; }
    .goog-te-combo {
        background-color: #fff;
        color: #000;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 6px 8px;
    }
    .skiptranslate.goog-te-gadget { padding-left: 60px; padding-bottom: 20px; }
    #goog-gt-tt { display: none !important; }
`;
document.head.appendChild(style);
