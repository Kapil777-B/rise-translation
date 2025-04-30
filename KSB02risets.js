function createGoogleTranslateWidget() {
    const translateDiv = document.createElement('div');
    translateDiv.id = 'google_translate_element';
    const targetDiv = document.querySelector('.cover__header-content-title');
    targetDiv.parentNode.insertBefore(translateDiv, targetDiv.nextSibling);
    
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script1);

    if (!window.googleTranslateElementInit) {
        window.googleTranslateElementInit = function() {
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL
            }, 'google_translate_element');
        }
    }
}

function resetCourseOnLanguageChange() {
    // Force the page to reset or reload when language is changed
    const currentLanguage = document.documentElement.lang;  // Get current language
    const languageSelector = document.querySelector('.goog-te-combo');  // Language selector dropdown
    
    // Event listener to detect language change
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            // Reset the course content by forcing a reload
            location.reload();  // Simple page reload to reset the course state
            
            // Alternatively, you could navigate back to the welcome screen or reset visited slides
            // Example (this might need specific Rise navigation API or workarounds):
            // window.location.href = 'path_to_welcome_screen';  // Reset to the first slide or welcome page
        });
    }
}

function checkForTargetElement() {
    const targetElement = document.querySelector('.cover__header-content-title');
    const buttonExists = document.querySelector('#google_translate_element');

    if (targetElement && !buttonExists) {
        createGoogleTranslateWidget();
    }
}

// MutationObserver to handle dynamic content loading and trigger translation when content changes
const observer = new MutationObserver(() => {
    checkForTargetElement();
    if (window.googleTranslateElementInit) {
        // Re-run translation for any new page content
        const googleTranslateElement = document.querySelector('.goog-te-gadget');
        if (googleTranslateElement) {
            googleTranslateElement.style.display = 'inline-block';
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// Run the initial check
checkForTargetElement();

// Initialize language reset functionality
resetCourseOnLanguageChange();

// Styling to improve the widget appearance
const style = document.createElement('style');
style.textContent = `
    iframe[id=":1.container"] { display: none !important; }
    body {top: 0 !important;}
    .goog-logo-link {display: none !important;}
    .goog-te-gadget { color: transparent !important; }
    .VIpgJd-ZVi9od-l4eHX-hSRGPd { display: none; }
    .goog-te-combo { 
        background-color: #fff; 
        color: #000000; 
        border: 1px solid transparent; 
        box-shadow: 0 4px 4px rgba(0,0,0,.1); 
        border-radius: 3px; 
        padding: 6px 8px; 
        transition: transform .3s;
    }
    .skiptranslate.goog-te-gadget { padding-left: 60px; padding-bottom: 20px; }
    #goog-gt-tt #goog-gt-vt { display: none !important; }
    .VIpgJd-ZVi9od-aZ2wEe-wOHMyf.VIpgJd-ZVi9od-aZ2wEe-wOHMyf-ti6hGc { display: none !important; }
`;
document.head.appendChild(style);
