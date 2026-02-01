import React from 'react';
import { useTranslation } from 'react-i18next';

const Settings = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'sw', name: 'Swahili', flag: '🇹🇿' },
        { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Settings</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`flex items-center justify-center p-3 border rounded-md transition ${i18n.language === lang.code ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <span className="text-2xl mr-2">{lang.flag}</span>
                                    <span className="text-sm font-medium">{lang.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
