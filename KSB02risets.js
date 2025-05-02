(function () {
    // STEP 1: Inject Google Translate Widget
    function injectGoogleTranslate() {
        if (document.querySelector('#google_translate_element')) return;

        const translateDiv = document.createElement('div');
        translateDiv.id = 'google_translate_element';
        const target = document.querySelector('.cover__header-content-title');
        if (target) target.parentNode.insertBefore(translateDiv, target.nextSibling);

        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);

        window.googleTranslateElementInit = function () {
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL
            }, 'google_translate_element');
        };
    }

    // STEP 2: Watch for target element to appear
    const observer = new MutationObserver(() => injectGoogleTranslate());
    observer.observe(document.body, { childList: true, subtree: true });
    injectGoogleTranslate(); // Run once immediately

    // STEP 3: Detect language change and flag for reset
    function monitorLangChange() {
        const interval = setInterval(() => {
            const combo = document.querySelector('.goog-te-combo');
            if (combo) {
                combo.addEventListener('change', () => {
                    const lang = combo.value;
                    localStorage.setItem('selectedLang', lang);
                    localStorage.setItem('forceRestart', 'yes');
                    location.reload(); // Soft reload → triggers SCORM reset on next load
                });
                clearInterval(interval);
            }
        }, 500);
    }
    monitorLangChange();

    // STEP 4: If flagged, reset SCORM & relaunch from start
    if (localStorage.getItem('forceRestart') === 'yes') {
        localStorage.removeItem('forceRestart');

        // SCORM Reset
        try {
            if (typeof SCORM2004_CallSetValue === 'function') {
                SCORM2004_CallSetValue("cmi.suspend_data", "");
                SCORM2004_CallSetValue("cmi.exit", "normal");
                SCORM2004_CallSetValue("cmi.completion_status", "incomplete");
                SCORM2004_CallCommit();
                SCORM2004_CallTerminate();
            } else if (typeof doLMSSetValue === 'function') {
                doLMSSetValue("cmi.suspend_data", "");
                doLMSSetValue("cmi.exit", "");
                doLMSSetValue("cmi.core.lesson_status", "incomplete");
                doLMSCommit();
                doLMSFinish();
            }
        } catch (e) {
            console.warn("No SCORM API found:", e);
        }

        localStorage.clear();
        sessionStorage.clear();

        // Hard reload from base URL
        setTimeout(() => {
            window.location.href = window.location.origin + window.location.pathname;
        }, 800);
    }

    // STEP 5: Auto-apply stored language on reload
    function applyStoredLang() {
        const lang = localStorage.getItem('selectedLang');
        if (!lang) return;
        const interval = setInterval(() => {
            const combo = document.querySelector('.goog-te-combo');
            if (combo) {
                combo.value = lang;
                combo.dispatchEvent(new Event('change'));
                clearInterval(interval);
            }
        }, 500);
    }
    applyStoredLang();

    // STEP 6: Optional cleanup styles
    const style = document.createElement('style');
    style.textContent = `
        .goog-logo-link, .VIpgJd-ZVi9od-l4eHX-hSRGPd, #goog-gt-tt, iframe[id=":1.container"] {
            display: none !important;
        }
        .goog-te-gadget { color: transparent !important; }
        .goog-te-combo {
            background-color: #fff;
            color: #000;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 6px 8px;
        }
    `;
    document.head.appendChild(style);
})();
