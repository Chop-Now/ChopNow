import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Valid languages: en, fr, sw (Swahili), rw (Kinyarwanda)
const resources = {
    en: {
        translation: {
            "welcome": "Welcome to ChopNow",
            "login": "Login",
            "register": "Register",
            "logout": "Logout",
        }
    },
    fr: {
        translation: {
            "welcome": "Bienvenue sur ChopNow",
            "login": "Connexion",
            "register": "S'inscrire",
            "logout": "Déconnexion",
        }
    },
    sw: {
        translation: {
            "welcome": "Karibu ChopNow",
            "login": "Ingia",
            "register": "Jisajili",
            "logout": "Ondoka",
        }
    },
    rw: {
        translation: {
            "welcome": "Murakaza neza kuri ChopNow",
            "login": "Injira",
            "register": "Iyandikishe",
            "logout": "Loga usohoke",
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
