import { Injectable } from '@angular/core';
import i18next from 'i18next';
import en from '../../assets/i18n/en.json'
import fr from '../../assets/i18n/fr.json'

@Injectable({
   providedIn: 'root',
})
export class I18nService {
   constructor() {
      i18next
         .init({
            lng: 'en', // langue par défaut
            resources: {
               fr: {
                  translation: fr
               },
               en: {
                  translation: en
               }
            }
         });
   }

   t(key: string, options?: any): string {
      const result = i18next.t(key, options);
      return typeof result === 'string' ? result : JSON.stringify(result);
   }

   on(event: string = 'languageChanged', callback: () => void) {
      i18next.on(event, callback);
   }

   changeLanguage(lang: string) {
      i18next.changeLanguage(lang);
   }

   get currentLanguage() {
      return i18next.language;
   }
}
