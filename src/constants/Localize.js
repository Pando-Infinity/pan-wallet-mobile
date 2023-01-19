import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import en from './translations/en';
import vi from './translations/vi';
import ja from './translations/ja';
import ko from './translations/ko';
import { storage } from 'databases/index';
import { NativeModules, Platform } from 'react-native';

const LANGUAGES = { en, vi, ja, ko };

const LANG_CODES = Object.keys(LANGUAGES);

const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: callback => {
    const language = storage.getString('user-language');
    if (language) {
      callback(language);
    } else {
      const findBestAvailableLanguage =
        RNLocalize.findBestAvailableLanguage(LANG_CODES);
      callback(
        findBestAvailableLanguage !== undefined
          ? findBestAvailableLanguage.languageTag
          : 'en',
      );
    }
  },
  init: () => {},
  cacheUserLanguage: language => {
    storage.set('user-language', language);
    Platform.OS === 'android'
      ? NativeModules.MultilingualModule.updateLanguage(language)
      : NativeModules.MultilanguageModule.updateLanguage(language);
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: LANGUAGES,
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
  });
