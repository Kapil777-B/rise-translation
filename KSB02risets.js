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

function checkForTargetElement() {
    const targetElement = document.querySelector('.cover__header-content-title');
    const buttonExists = document.querySelector('#google_translate_element');
    if (targetElement && !buttonExists) {
        createGoogleTranslateWidget();
    }
}

// Run once and observe DOM changes
checkForTargetElement();

const observer = new MutationObserver(() => {
    checkForTargetElement();
});
observer.observe(document.body, { childList: true, subtree: true });

// Store selected language and reload
function resetCourseOnLanguageChange() {
    const interval = setInterval(() => {
        const selector = document.querySelector('.goog-te-combo');
        if (selector) {
            selector.addEventListener('change', function () {
                const selectedLang = this.value;
                localStorage.setItem('selectedLang', selectedLang);

                // Reset Rise progress (local/session storage)
                localStorage.clear();
                sessionStorage.clear();

                // Reload the page after a brief delay
                setTimeout(() => {
                    location.reload(true);
                }, 1000);
            });

            clearInterval(interval);
        }
    }, 1000);
}

resetCourseOnLanguageChange();

// On page load, apply previously selected language
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
        }, 1000);
    }
}

applyStoredLanguage();

// Custom styles to clean up Google Translate UI
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
