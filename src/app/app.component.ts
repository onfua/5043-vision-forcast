import { Component, inject, OnInit } from '@angular/core';
import { CoreBase, IUserContext } from '@infor-up/m3-odin';
import { MIService, UserService } from '@infor-up/m3-odin-angular';
import { I18nService } from '../services/i18n/i18n.service';
import version from '../assets/version.json'
@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})
export class AppComponent extends CoreBase implements OnInit {
   userContext = {} as IUserContext;
   isBusy = false;
   cono: string;
   divi: string;
   faci: string;
   usid: string;
   params: any;
   version: any = version;
   allapi: string = ''
   system = navigator
   locale: string = ''
   language: string = ''
   //@ts-ignore
   browser = `${navigator.userAgentData.brands[navigator.userAgentData.brands.length - 1].brand} (${navigator.userAgentData.brands[navigator.userAgentData.brands.length - 1].version})`
   whlo: string = ""

   i18n = inject(I18nService);
   constructor(private miService: MIService, private userService: UserService) {
      super('AppComponent');
   }

   switchLanguage(lang: string = 'en') {
      this.i18n.changeLanguage(lang);
   }

   public setBusy(isBusy: boolean) {
      this.isBusy = isBusy;
   }

   updateUserValues(userContext: IUserContext) {
      this.cono = userContext.currentCompany
      this.divi = userContext.currentDivision
      this.faci = userContext.FACI
      this.usid = userContext.USID
      this.language = userContext.language
      this.locale = userContext.languageTag
      this.whlo = userContext.WHLO

      //update language in i18n service
      this.i18n.changeLanguage(this.language == 'FR' ? 'fr' : 'en');
      Soho.Locale.set(this.language == 'FR' ? 'fr-FR' : 'en-US');
   }

   ngOnInit() {
      this.userService.getUserContext().subscribe((userContext: IUserContext) => {
         this.setBusy(false);
         this.userContext = userContext;
         this.updateUserValues(userContext);
      }, (error) => {
         this.setBusy(false);
         this.logError('Unable to get userContext ' + error);
      });
      this.allapi = `<p>${this.i18n.t('list_api')} :</p> <br/> <p>` + this.version.APIs?.map((api) => {
         return `${api.program}/${api.transaction}<br/>`
      }).join('') + '</p>'
      this.i18n.on('languageChanged', () => {
         this.allapi = `<p>${this.i18n.t('list_api')} :</p> <br/> <p>` + this.version.APIs?.map((api) => {
            return `${api.program}/${api.transaction}<br/>`
         }).join('') + '</p>'
      })
   }

   showVersion() {
      const modal = {
         'add-context': {
            'title': '',
            'id': 'my-id',
            'content': $('#modal-version'),
            'showCloseBtn': true,
            'triggerButton': $('#add-context'),
            attributes: [{ name: 'id', value: 'add-context-modal' }, { name: 'data-automation-id', value: 'add-context-modal-auto' }],
         },
         'add-context-full': {
            'title': 'Add Context Full',
            'id': 'my-id',
            'content': $('#modal-add-context-full'),
            'showCloseBtn': true,
            'triggerButton': $('#add-context-full'),
            fullsize: 'responsive',
            attributes: [{ name: 'id', value: 'add-context-modal' }, { name: 'data-automation-id', value: 'add-context-modal-auto' }],
         },
      }
      const setModal = function (opt) {
         opt = $.extend({}, opt);

         $('body').modal(opt);
      };
      setModal(modal['add-context']);
   }
   copyToClip() {
      const verDescElement = document.querySelector('.ver_desc');
      if (verDescElement) {
         const range = document.createRange();
         range.selectNode(verDescElement);
         window.getSelection()?.removeAllRanges();
         window.getSelection()?.addRange(range);
         try {
            document.execCommand('copy');
            window.getSelection()?.removeAllRanges();
         } catch (err) {
            console.error('Échec de la copie : ', err);
         }
      }
   }
}
