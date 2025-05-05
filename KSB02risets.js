(function () {
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

    const observer = new MutationObserver(() => injectGoogleTranslate());
    observer.observe(document.body, { childList: true, subtree: true });
    injectGoogleTranslate();

    // Monitor Google Translate dropdown and trigger reset
    function monitorLangChange() {
        const interval = setInterval(() => {
            const combo = document.querySelector('.goog-te-combo');
            if (combo) {
                combo.addEventListener('change', () => {
                    const lang = combo.value;
                    localStorage.setItem('selectedLang', lang);
                    localStorage.setItem('forceRestart', 'yes');
                    location.reload();
                });
                clearInterval(interval);
            }
        }, 500);
    }
    monitorLangChange();

    // On reload, if flagged, clear suspend data and reset Rise
    function resetIfNeeded() {
        if (localStorage.getItem('forceRestart') === 'yes') {
            localStorage.removeItem('forceRestart');

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
                console.warn("SCORM not found:", e);
            }

            localStorage.clear();
            sessionStorage.clear();

            // Final reload to clear cache
            setTimeout(() => {
                window.location.href = window.location.origin + window.location.pathname;
            }, 500);
        }
    }
    resetIfNeeded();

    // Re-apply stored language after reload
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

    // Clean up Google Translate UI
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
            font-size: 14px;
            margin: 5px;
        }
        #google_translate_element {
            margin-top: 10px;
            text-align: right;
        }
    `;
    document.head.appendChild(style);
})();
