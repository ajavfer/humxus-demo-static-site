(function(){
    // Generated i18n file (build_i18n.py)
    const translations = {
    "en": {
        "auto.user.58_106f553e": "Book Now",
        "auto.user.59_867fb4b9": "HKD 2,000/day",
        "home.hero.title": "Humanoid Services Dashboard",
        "home.cta.book": "Book Now",
        "user.booking.title": "Book a Humanoid Service"
    },
    "yue": {
        "home.hero.title": "類人服務儀表板",
        "home.cta.book": "立即預訂",
        "user.booking.title": "預訂仿生人服務"
    },
    "zh": {
        "home.hero.title": "类人服务仪表板",
        "home.cta.book": "立即预订",
        "user.booking.title": "预订类人服务"
    }
};

    // Expose minimal helper and applyTranslations for compatibility with existing code.
    function getLang(lang) {
        if (!lang) lang = localStorage.getItem('selectedLanguage') || 'en';
        return (lang && translations[lang]) ? lang : 'en';
    }

    function applyTranslations(lang) {
        const l = getLang(lang);
        const dict = translations[l] || {};
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = dict[key] || (translations['en'] && translations['en'][key]) || '';
            if (!text) return;
            el.textContent = String(text);
        });
        document.querySelectorAll('[data-i18n-alt]').forEach(el => {
            const key = el.getAttribute('data-i18n-alt');
            const text = dict[key] || (translations['en'] && translations['en'][key]) || '';
            if (text) el.alt = String(text);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const text = dict[key] || (translations['en'] && translations['en'][key]) || '';
            if (text) el.placeholder = String(text);
        });
    }

    translations.t = function(key, lang){
        const l = getLang(lang);
        const dict = translations[l] || {};
        return dict[key] || (translations['en'] && translations['en'][key]) || '';
    };

    window.i18n = translations;
    window.applyTranslations = applyTranslations;
})();
