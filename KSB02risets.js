(function () {
    // Inject Google Translate Widget
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

    // Run when DOM changes
    const observer = new MutationObserver(() => injectGoogleTranslate());
    observer.observe(document.body, { childList: true, subtree: true });
    injectGoogleTranslate();

    // Reload page on language change
    function monitorLangChange() {
        const interval = setInterval(() => {
            const combo = document.querySelector('.goog-te-combo');
            if (combo) {
                combo.addEventListener('change', () => {
                    setTimeout(() => {
                        location.reload(); // Just reload the browser
                    }, 500); // slight delay to allow Google Translate to process
                });
                clearInterval(interval);
            }
        }, 500);
    }
    monitorLangChange();

    // Optional styling cleanup (optional)
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
