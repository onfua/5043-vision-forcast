import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { I18nService } from '../../services/i18n/i18n.service';
import { forecastColumns, itnoColumns, ois302Columns, whloColumns } from '../../utils/columns';
import { IMIRequest } from '@infor-up/m3-odin';
import { ApplicationService, MIService, UserService } from '@infor-up/m3-odin-angular';

@Component({
   selector: 'app-dashboard',
   templateUrl: './dashboard.component.html',
   styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements AfterViewInit, OnInit {
   i18n = inject(I18nService);
   columns: SohoDataGridColumn[] = [];
   ois302columns: SohoDataGridColumn[] = [];
   columns_WHLO: SohoDataGridColumn[] = [];
   columns_ITNO: SohoDataGridColumn[] = [];
   stockEmptyMessage: SohoEmptyMessageOptions = {};
   data = [];
   varWHLO: string = '';
   varITNO: string = '';
   varITDS: string = '';
   varSTQT: string = '';
   varNextOrderNumber: string = '';
   varDateNextOrder: string = '';
   varNextOrderQty: string = '';
   data_whlo: any[]
   data_item: any[] = [];
   disabled: boolean = true;
   cono: string = '';
   dateFormat: string = 'DMY';
   isForecastBusy: boolean = false;
   isBusyAll: boolean = false;
   dataOis302: any[] = []
   isOis302Busy: boolean = false
   positionContext = {
      cell: 0,
      row: 0
   }
   contextEntries: any[] = [];
   purchase_type = {
      type: '',
      num: ''
   }


   getPosition(event) {
      this.positionContext.cell = event.cell
      this.positionContext.row = event.row
   }

   constructor(private miService: MIService, private appService: ApplicationService) {
      this.updateColumns();
      this.i18n.on('languageChanged', () => {
         this.updateColumns();
      });

   }
   async ngOnInit() {
      this.isBusyAll = true;
      await this.getWHLODefault()
      await this.getWHLOData()
      await this.getItem();
      this.isBusyAll = false;
   }
   ngAfterViewInit(): void {
      const splitElement = document.getElementById('split');
      setInterval(() => {
         const rect = splitElement.getBoundingClientRect();
         const forecastDataGrid = document.getElementById('forecastDataGrid') as HTMLElement;
         const ois300DataGrid = document.getElementById('ois300DataGrid') as HTMLElement;
         if (ois300DataGrid) {
            ois300DataGrid.setAttribute('style', `height: calc(100vh - ${rect.top + 65}px)`);
         }
         if (forecastDataGrid) {
            forecastDataGrid.setAttribute('style', `height: ${rect.top - 80}px;`);
         }
      }, 100);
   }

   async onChangeWHLO(event: any) {
      this.disabled = true
      this.isBusyAll = true
      this.varWHLO = event.values ? event.values : event.target.value;
      await this.getItem();
      if (this.varITNO !== '' && this.varWHLO !== '') {
         if (this.data_item.find((a) => { return a.ITNO === this.varITNO })) {
            await this.calculHeader()
            this.disabled = false
         } else {
            this.disabled = true
         }
      } else {
         this.disabled = true
      }
      this.isBusyAll = false
   }


   /** *
    * @description Handles the change event for the item number input.
   * Updates the item description and enables/disables the next order fields based on the input.
   * @param event The change event from the input field.
   */
   async onChangeITNO(event: any) {
      this.disabled = true
      this.varITDS = event.values ? event[0].data.ITDS : '';
      this.varITNO = event.values ? event.values : event.target.value;
      if (this.varITNO !== '' && this.varWHLO !== '') {
         const tmp = this.data_item.find((a) => { return a.ITNO === this.varITNO })
         if (tmp) {
            await this.calculHeader()
            this.varITDS = tmp[0] ? tmp[0].ITDS : tmp.ITDS
            this.disabled = false
         } else {
            this.disabled = true
         }
      } else {
         this.disabled = true
      }

      // if (this.varITNO !== '') {

      //    // const acquisitionCd = await this.getAcquisitionCd();
      //    // if (acquisitionCd === '3') {
      //    //    const nextDistributionDetail = await this.getNextDetail(3);
      //    //    this.varNextOrderNumber = nextDistributionDetail.length > 0 ? nextDistributionDetail[0].TRNR : '';
      //    //    this.varDateNextOrder = nextDistributionDetail.length > 0 ? this.convertToDate(nextDistributionDetail[0].RIDT) : '';
      //    //    this.varNextOrderQty = nextDistributionDetail.length > 0 ? nextDistributionDetail[0].TRQT : '';
      //    //    this.purchase_type.type = nextDistributionDetail.length > 0 ? 'DIS' : ''
      //    //    this.purchase_type.num = nextDistributionDetail.length > 0 ? nextDistributionDetail[0].TRNR : ''
      //    // }

      //    // if (acquisitionCd === '2') {
      //    //    const nextDistributionDetail = await this.getNextDetail(2);
      //    //    this.varNextOrderNumber = nextDistributionDetail.length > 0 ? nextDistributionDetail[0].PUNO : '';
      //    //    this.varDateNextOrder = nextDistributionDetail.length > 0 ? this.convertToDate(nextDistributionDetail[0].DWDT) : '';
      //    //    this.varNextOrderQty = nextDistributionDetail.length > 0 ? nextDistributionDetail[0].ORQA : '';
      //    //    this.purchase_type.type = nextDistributionDetail.length > 0 ? 'PUR' : ''
      //    //    this.purchase_type.num = nextDistributionDetail.length > 0 ? nextDistributionDetail[0].PUNO : ''
      //    // }

      // }
   }

   private async calculHeader() {
      await this.getStockItem();
      const nextDistributionDetail = await this.getNextDetail();
      this.varNextOrderNumber = nextDistributionDetail.RIDN;
      this.varDateNextOrder = this.convertToDate(nextDistributionDetail.PLDT);
      this.varNextOrderQty = nextDistributionDetail.TRQT;
      this.purchase_type.type = nextDistributionDetail.type
      this.purchase_type.num = nextDistributionDetail.RIDN
   }

   onNextClick() {
      if (this.purchase_type.num && this.purchase_type.type) {
         if (this.purchase_type.type === 'DIS') {
            const uri = `bookmark?program=MMS101&startPanel=B&includeStartPanel=True&tableName=MGLINE&sortingOrder=1&source=MForms&requirePanel=True&keys=MRCONO%2C${this.cono}%2CMRTRNR%2C${this.purchase_type.num}%2CMRPONR%2C%20%2CMRPOSX%2C%20&fields=WRWHLO%2C${this.varWHLO}%2CWRITNO%2C%2520%2CWRTRQT%2C%2520%2CWRALUN%2C%2520%2CWRWHSL%2C%2520%2CWRRSCD%2C%2520%2CW1PONR%2C%2520%2CW1POSX%2C%2520&LogicalId=lid://infor.m3.m3`;
            // console.log('Condit. Manuel');
            this.appService.launch(uri);
         }

         if (this.purchase_type.type === 'PUR') {
            const uri = `bookmark?program=PPS201&startPanel=B&includeStartPanel=True&tableName=MPLINE&sortingOrder=1&source=MForms&requirePanel=True&keys=IBCONO%2C${this.cono}%2CIBPUNO%2C%2B%2CIBPNLI%2C%2B%2CIBPNLS%2C%2B&parameters=IAPUNO%2C${this.purchase_type.num}&fields=WBWHLO%2C${this.varWHLO}%2CWBPNLI%2C%2520%2CWBPNLS%2C%2520%2CWBITNO%2C%2520%2CWBORQA%2C%2520%2CWBPUUN%2C%2520%2CWBPUPR%2C%2520%2CWBPPUN%2C%2520%2CWBDT4T%2C1%2CWBDWDT%2C250528%2CW1PNLI%2C%2520%2CW1PNLS%2C%2520&LogicalId=lid://infor.m3.m3`;
            // console.log('Condit. Manuel');
            this.appService.launch(uri);
         }
      }
   }

   /**
    * @description Applies the filter to the data grid.
    */
   async applyFilter() {
      await Promise.all([
         this.loadForecastData(),
         this.loadOis302Data()
      ]);
   }

   /**
    * @description Loads the forecast data for the selected warehouse and item number.
    * It fetches the Customer Orders (CO) and calculates the balance based on the stock quantity.
    */
   private async loadForecastData() {
      this.isForecastBusy = true;
      const fo = await this.getDataForForecast()  //get all forecast data
      const co = await this.getDataForCO();  //get all customer orders data
      let all = this.mixData(fo, co)
      all = this.calculateBalance(all);
      this.data = all.map(item => ({
         PRDT: item.PLDT,
         PRDTT: item.DWDT,
         TYPE: item.TYPE,
         CAMU: parseFloat(item.ORQA),
         WHSL: item.ORST,
         STQT: item.STQT,
         PRTS: item.CUNO,
         ATV1: item.ORNO,
         ATV2: item.ORTP,
      }))
      this.isForecastBusy = false;
   }

   private async loadOis302Data() {
      this.isOis302Busy = true
      const data = await this.getOis302Data()
      this.dataOis302 = data.map(item => ({
         ITNO: item.OBITNO,
         CODT: item.OBCODT,
         ORST: item.OBORST,
         ORNO: item.OBORNO,
         PONR: item.OBPONR,
         POSX: item.OBPOSX,
         WHLO: item.OBWHLO,
         CUOR: item.OBCUOR,
         CUNO: item.OBCUNO,
         ORQT: Number(item.OBORQT),
         RNQT: Number(item.OBRNQT),
         ALQT: Number(item.OBALQT),
         PLQT: Number(item.OBPLQT),
         DLQT: Number(item.OBDLQT),
         IVQT: Number(item.OBIVQT),
         FACI: item.OBFACI,
      }))
      this.isOis302Busy = false
   }

   /**
    * @description Updates the columns based on the current language.
    */
   private updateColumns() {
      this.columns = forecastColumns({
         plan_date: this.i18n.t('PLAN_DATE'),
         reqDelDa: this.i18n.t('ReqDelDate'),
         qtyReq: this.i18n.t('qtyReq'),
         allocated: this.i18n.t('allocated'),
         balance: this.i18n.t('balance'),
         customer: this.i18n.t('customer'),
         CONumber: this.i18n.t('CONumber'),
         COType: this.i18n.t('COType'),
         clickPRDT: () => {
            const uri = `bookmark?program=MMS080&startPanel=B&includeStartPanel=True&tableName=MITPLO&sortingOrder=21&source=MForms&requirePanel=True&keys=MOCONO%2C${this.cono}%2CMOWHLO%2C%2B%2CMOITNO%2C%2B%2CMOPLDT%2C%2B%2CMOTIHM%2C%2B%2CMOORCA%2C%2B%2CMORIDN%2C%2B%2CMORIDL%2C%2B%2CMORIDX%2C%2B%2CMORIDI%2C%2B%2CMOSTAT%2C%2B&fields=WWWHLO%2C${this.varWHLO}%2CWWITNO%2C${this.varITNO}%2CWWDPID%2C%2520%2CWWPOOT%2C%2520&LogicalId=lid://infor.m3.m3`;
            // console.log('Condit. Manuel');
            this.appService.launch(uri);
         },
         clickORNO: (event, cell) => {
            if (cell.length === 0) return
            const item = cell[0].item.ATV1
            if (item) {
               const uri = `bookmark?program=OIS300&startPanel=B&includeStartPanel=True&tableName=OOHEAD&sortingOrder=1&source=MForms&view=M01&requirePanel=True&keys=OACONO%2C430%2COAORNO%2C${item}&fields=WWFACI%2C%2520%2CWWDEL%2C0%2CW1OBKV%2C${item}&LogicalId=lid://infor.m3.m3`;
               // console.log('Condit. Manuel');
               this.appService.launch(uri);
            }
         }
      });
      this.ois302columns = ois302Columns({
         item_number: this.i18n.t("item_number"),
         CODT: this.i18n.t("CODT"),
         HiS: this.i18n.t("HiS"),
         PONR: this.i18n.t("PONR"),
         POSX: this.i18n.t("POSX"),
         WHLO: this.i18n.t("WHLO"),
         CUOR: this.i18n.t("CUOR"),
         ORQT: this.i18n.t("ORQT"),
         RNQT: this.i18n.t("RNQT"),
         ALQT: this.i18n.t("ALQT"),
         PLQT: this.i18n.t("PLQT"),
         DLQT: this.i18n.t("DLQT"),
         IVQT: this.i18n.t("IVQT"),
         FACI: this.i18n.t("FACI"),
         CONumber: this.i18n.t('CONumber'),
         customer: this.i18n.t('customer'),
         clickITNO: (event, cell) => {
            if (cell.length === 0) return
            const item = cell[0].item
            if (item) {
               const uri = `bookmark?program=MMS080&startPanel=B&includeStartPanel=True&tableName=MITPLO&sortingOrder=1&source=MForms&requirePanel=True&keys=MOCONO%2C${this.cono}%2CMOWHLO%2C%2B%2CMOITNO%2C%2B%2CMOPLDT%2C%2B%2CMOTIHM%2C%2B%2CMOORCA%2C%2B%2CMORIDN%2C%2B%2CMORIDL%2C%2B%2CMORIDX%2C%2B%2CMORIDI%2C%2B%2CMOSTAT%2C%2B&fields=WWWHLO%2C${item.WHLO}%2CWWITNO%2C${item.ITNO}%2CW1SLID%2C%2520%2CW1PLDT%2C%2520%2CW1ORCA%2C%2520%2CW1STAT%2C%2520&LogicalId=lid://infor.m3.m3`;
               // console.log('Condit. Manuel');
               this.appService.launch(uri);
            }
         },
         clickORNO: (event, cell) => {
            if (cell.length === 0) return
            const item = cell[0].item
            if (item) {
               const uri = `bookmark?program=OIS100&panel=A&tableName=OOHEAD&source=Web&keys=OACONO%2C${this.cono}%2COAORNO%2C${item.ORNO}&LogicalId=lid://infor.m3.m3`;
               // console.log('Condit. Manuel');
               this.appService.launch(uri);
            }
         },
         clickPONR: (event, cell) => {
            if (cell.length === 0) return
            const item = cell[0].item
            if (item) {
               const uri = `bookmark?program=OIS101&startPanel=B&includeStartPanel=True&tableName=OOLINE&sortingOrder=1&source=MForms&view=M03&requirePanel=True&keys=OBCONO%2C430%2COBORNO%2C%2B%2COBPONR%2C%20%2COBPOSX%2C%20&fields=WBQTTB%2C1%2COBWHLO%2C700%2COBPONR%2C%2520%2CWBITNO%2C%2520%2CWBORQA%2C%2520%2COBALUN%2C%2520%2CWBSAPR%2C%2520%2CWBDWDZ%2C250711%2CWBDWHZ%2C1541%2CB1PONR%2C%2520%2CB1POSX%2C%2520&LogicalId=lid://infor.m3.m3`;
               // console.log('Condit. Manuel');
               this.appService.launch(uri);
            }
         },
      });
      this.columns_WHLO = whloColumns({
         WHLO: this.i18n.t("WHLO"),
         WHNM: this.i18n.t("WHNM"),
      });
      this.columns_ITNO = itnoColumns({
         ITNO: this.i18n.t("item_number"),
         ITDS: this.i18n.t("ITDS"),
      });
      this.stockEmptyMessage = { title: this.i18n.t('noData'), icon: 'icon-empty-no-orders' };
      this.contextEntries = [
         {
            displayString: this.i18n.t('change'),
            disabled: false,
            shortcut: "CTRL+2",
            click: () => {
               const data = this.dataOis302[this.positionContext.row]
               const uri = `bookmark?program=OIS100&panel=E&tableName=OOLINE&source=Web&option=2&keys=OBCONO%2C${this.cono}%2COBORNO%2C${data.ORNO}%2COBPONR%2C${data.PONR}%2COBPOSX%2C${data.POSX}&LogicalId=lid://infor.m3.m3`;
               // console.log('Condit. Manuel');
               this.appService.launch(uri);
            }
         },
         // {
         //    displayString: this.i18n.t('delete'),
         //    disabled: false,
         //    shortcut: "CTRL+3",
         //    click: () => {
         //       const data = this.dataOis302[this.positionContext.row]
         //       const uri = `bookmark?program=OIS119&panel=D&source=Web&option=4&LogicalId=lid://infor.m3.m3`;
         //       // console.log('Condit. Manuel');
         //       this.appService.launch(uri);
         //    }
         // },
         {
            displayString: this.i18n.t('display'),
            disabled: false,
            shortcut: "CTRL+5",
            click: () => {
               const data = this.dataOis302[this.positionContext.row]
               const uri = `bookmark?program=OIS100&panel=E&tableName=OOLINE&source=Web&option=5&keys=OBCONO%2C${this.cono}%2COBORNO%2C${data.ORNO}%2COBPONR%2C${data.PONR}%2COBPOSX%2C${data.POSX}&LogicalId=lid://infor.m3.m3`;
               // console.log('Condit. Manuel');
               this.appService.launch(uri);
            }
         }
      ]
   }

   /**
    * @description Fetches the list of warehouses.
    * @returns Array of warehouses with WHLO and WHNM.
    */
   private async getWHLOData() {
      const req: IMIRequest = {
         program: 'MMS005MI',
         transaction: 'LstWarehouses',
         maxReturnedRecords: 0,
      };

      try {
         const response = await this.miService.execute(req).toPromise();
         this.data_whlo = response.items.map(item => ({
            WHLO: item.WHLO,
            WHNM: item.WHNM,
         }));

      } catch (error) {
         console.error('Error fetching warehouse:', error);
      }
   }

   /**
    * @description Fetches the default warehouse and date format for the user.
    */
   private async getWHLODefault() {
      const req: IMIRequest = {
         program: 'MNS150MI',
         transaction: 'GetUserData',
         maxReturnedRecords: 0,
      };

      try {
         const response = await this.miService.execute(req).toPromise();
         this.varWHLO = response.item['WHLO'] || '';
         this.cono = response.item['CONO'] || '';
         this.dateFormat = response.item['DTFM'] || 'DMY';
      } catch (error) {
         console.error('Error fetching warehouse:', error);
      }
   }

   /**
    * @description Fetches the items in the specified warehouse.
    * @returns Array of items with ITNO and ITDS.
    */
   private async getItem() {
      const req: IMIRequest = {
         program: 'MMS200MI',
         transaction: 'LstItmWhsByWhs',
         record: {
            WHLO: this.varWHLO
         },
         maxReturnedRecords: 0,
      };

      try {
         const response = await this.miService.execute(req).toPromise();
         this.data_item = response.items.map(item => ({
            ITNO: item.ITNO,
            ITDS: item.ITDS,
         }));

      } catch (error) {
         this.data_item = []
         console.error('Error fetching items:', error);
      }
   }

   /** * @description Fetches the stock quantity for the item in the specified warehouse.
    * @returns Stock quantity as a string.
    */
   private async getStockItem() {
      const req: IMIRequest = {
         program: 'MMS200MI',
         transaction: 'GetItmWhsBal',
         record: {
            WHLO: this.varWHLO,
            ITNO: this.varITNO
         },
         maxReturnedRecords: 0,
      };

      try {
         const response = await this.miService.execute(req).toPromise();
         this.varSTQT = response.item['STQT'] || '';

      } catch (error) {
         console.error('Error fetching items:', error);
      }
   }

   /**
    * @description Fetches the acquisition code for the item in the specified warehouse.
    * @returns Acquisition code as a string.
    */
   private async getAcquisitionCd() {
      if (!this.varITNO || !this.varWHLO) {
         return '';
      }

      const req: IMIRequest = {
         program: 'MMS200MI',
         transaction: 'GetItmWhsBasic',
         record: {
            WHLO: this.varWHLO,
            ITNO: this.varITNO
         },
         outputFields: ['PUIT'],
         maxReturnedRecords: 0,
      };

      try {
         const response = await this.miService.execute(req).toPromise();
         return response.item['PUIT'] || '';

      } catch (error) {
         console.error('Error fetching AcquisitionCd:', error);
         return '';
      }
   }

   /**
    * @description Fetches the next distribution or purchase detail based on the type.
    * @param type 2 for Purchase, 3 for Distribution
    * @returns [TRNR, TRQT, RIDT]
    */
   // private async getNextDetail(type: number) {
   //    if (type === 3) {
   //       const req: IMIRequest = {
   //          program: 'EXPORTMI',
   //          transaction: 'Select',
   //          record: {
   //             SEPC: ';',
   //             QERY: `MRTRNR, MRTRQT from MGLINE where MRITNO = '${this.varITNO}' and MRWHLO = '${this.varWHLO}' and MRTRSH < 50`,
   //          },
   //          maxReturnedRecords: 0,
   //       };

   //       try {
   //          const response = await this.miService.execute(req).toPromise();
   //          // const response.items.map(item => item.REPL);
   //          const items = response.items.map(item => item['REPL'].split(';'));
   //          const results = [];
   //          for (const tmp of items) {
   //             const reqHead: IMIRequest = {
   //                program: 'MMS100MI',
   //                transaction: 'GetHead',
   //                record: {
   //                   TRNR: tmp[0],
   //                },
   //                maxReturnedRecords: 0,
   //             };
   //             let RIDT = '';
   //             try {
   //                const headResponse = await this.miService.execute(reqHead).toPromise();
   //                RIDT = headResponse.item['RIDT'] || '';
   //             } catch { }
   //             results.push({
   //                TRNR: tmp[0],
   //                TRQT: tmp[1],
   //                RIDT: RIDT
   //             });
   //          }
   //          return results.sort((a, b) => {
   //             // Compare RIDT as numbers (yyyyMMdd format)
   //             return Number(a.RIDT) - Number(b.RIDT);
   //          });

   //       } catch (error) {
   //          console.error('Error fetching distributionNumbers:', error);
   //          return [];
   //       }
   //    }

   //    if (type === 2) {
   //       const req: IMIRequest = {
   //          program: 'EXPORTMI',
   //          transaction: 'Select',
   //          record: {
   //             SEPC: ';',
   //             QERY: `IBDWDT, IBORQA, IBPUNO from MPLINE where IBITNO = '${this.varITNO}' and IBWHLO = '${this.varWHLO}'`,
   //          },
   //          maxReturnedRecords: 0,
   //       };

   //       try {
   //          const response = await this.miService.execute(req).toPromise();
   //          // const response.items.map(item => item.REPL);
   //          const items = response.items.map(item => item['REPL'].split(';'));
   //          const results = [];
   //          for (const tmp of items) {
   //             results.push({
   //                DWDT: tmp[0],
   //                ORQA: tmp[1],
   //                PUNO: tmp[2]
   //             });
   //          }
   //          return results.sort((a, b) => {
   //             // Compare RIDT as numbers (yyyyMMdd format)
   //             return Number(a.DWDT) - Number(b.DWDT);
   //          });

   //       } catch (error) {
   //          console.error('Error fetching distributionNumbers:', error);
   //          return [];
   //       }
   //    }
   // }
   private async getNextDetail() {
      const res = {
         type: '',
         PLDT: '',
         TRQT: '',
         RIDN: ''
      }
      const reqT: IMIRequest = {
         program: 'MMS080MI',
         transaction: 'LstMtPlByItmWhs',
         record: {
            WHLO: this.varWHLO,
            ITNO: this.varITNO
         },
         maxReturnedRecords: 0,
      };
      try {
         const resT = await this.miService.execute(reqT).toPromise()
         const tmp = resT.items.sort((a, b) => {
            return Number(a.PLDT) - Number(b.PLDT)
         }).filter((a) => {
            return a.ORCA.substring(0, 1) === '2' || a.ORCA.substring(0, 1) === '5'
         })

         if (tmp[0]) {
            res.type = tmp[0].ORCA.substring(0, 1) === '2' ? 'PUR' : 'DIS'
            res.PLDT = tmp[0].PLDT
            res.RIDN = tmp[0].RIDN
            res.TRQT = tmp[0].TRQT
         }
      } catch { }

      return res;
   }


   /**
    * @description Converts a date string in format yyyyMMdd to a formatted date string.
    * @param dateString String in format yyyyMMdd
    * @returns date
    */
   private convertToDate(dateString: string): string {
      if (!dateString || dateString.length !== 8) {
         return '';
      }
      if (this.dateFormat === 'DMY') {
         return `${dateString.substring(6, 8)}/${dateString.substring(4, 6)}/${dateString.substring(0, 4)}`;
      } else if (this.dateFormat === 'MDY') {
         return `${dateString.substring(4, 6)}/${dateString.substring(6, 8)}/${dateString.substring(0, 4)}`;
      } else {
         return `${dateString.substring(0, 4)}/${dateString.substring(4, 6)}/${dateString.substring(6, 8)}`;
      }
   }

   /**
    *
    * @returns Fetches data for Customer Orders (CO) based on the selected warehouse and item number.
    */
   private async getDataForCO() {
      const req: IMIRequest = {
         program: 'MMS080MI',
         transaction: 'LstMtPlByItmWhs',
         record: {
            WHLO: this.varWHLO,
            ITNO: this.varITNO
         },
         outputFields: ['PLDT', 'ORCA', 'RIDN', 'RIDL'],
         maxReturnedRecords: 0,
      };
      const results = [];

      try {
         const response = await this.miService.execute(req).toPromise();
         results.push(...response.items.map(item => {
            if (item['ORCA'].substring(0, 1) === '3') {
               return {
                  PLDT: item['PLDT'],
                  TYPE: this.i18n.t('CUNO'),
                  ORNO: item['RIDN'],
                  RIDL: item['RIDL']
               }
            }
         }).filter(Boolean));



         if (results.length !== 0) {

            // If results are found, create a request to get the Requested Delivery Date
            for (const result of results) {
               const req1: IMIRequest = {
                  program: 'EXPORTMI',
                  transaction: 'Select',
                  record: {
                     SEPC: ';',
                     QERY: `OBDWDT, OBORQA, OBORST, OBCUNO, OBDLQA from OOLINE where OBORNO = '${result.ORNO}' and OBITNO = '${this.varITNO}' and OBWHLO = '${this.varWHLO}' and OBPONR = '${result.RIDL}'`,
                  },
                  maxReturnedRecords: 0,
               };
               try {
                  const response1 = await this.miService.execute(req1).toPromise();
                  if (response1.items.length > 0) {
                     result.DWDT = response1.items[0]['REPL'].split(';')[0];
                     let sum = 0;
                     for (const item of response1.items) {
                        sum += parseFloat(item['REPL'].split(';')[1]);
                        sum -= parseFloat(item['REPL'].split(';')[4]);
                     }
                     result.ORQA = sum;
                     result.ORST = response1.items[0]['REPL'].split(';')[2];
                     result.CUNO = response1.items[0]['REPL'].split(';')[3];
                  }
               } catch (error) {
                  console.error('Error fetching Requested Delivery Date:', error);
               }

               const req2: IMIRequest = {
                  program: 'EXPORTMI',
                  transaction: 'Select',
                  record: {
                     SEPC: ';',
                     QERY: `OAORTP from OOHEAD where OAORNO = '${result.ORNO}'`,
                  },
                  maxReturnedRecords: 0,
               };
               try {
                  const response2 = await this.miService.execute(req2).toPromise();
                  if (response2.items.length > 0) {
                     result.ORTP = response2.items[0]['REPL'];
                  }
               } catch (error) {
                  console.error('Error fetching Requested Delivery Date:', error);
               }
            }

         }
      } catch (error) {
         console.error('Error fetching date format:', error);
      }

      return results.sort((a, b) => {
         // Compare PLDT as numbers (yyyyMMdd format)
         return Number(a.PLDT) - Number(b.PLDT);
      });
   }

   /**
    *
    * @returns Fetches forecast data for the selected warehouse and item number.
    * It retrieves forecasted quantities and calculates the balance based on reserved quantities.
    * @description The method fetches forecast data, sorts it by date, and calculates the balance for each item.
    * It also retrieves reserved quantities and adjusts the forecasted quantities accordingly.
    */
   private async getDataForForecast() {
      const dat = new Date();
      const formatedDate = `${dat.getFullYear()}${(dat.getMonth() + 1).toString().padStart(2, '0')}${dat.getDate().toString().padStart(2, '0')}`;

      //test if the item is linked to planning entity
      let plan_item = null
      const reqPlan: IMIRequest = {
         program: 'RPS045MI',
         transaction: 'LstByWarehouse',
         record: {
            WHLO: this.varWHLO
         },
         outputFields: ['CCIT', 'FDAT'],
         maxReturnedRecords: 0,
      };
      try {
         let loopC = false
         const resReqPl = await this.miService.execute(reqPlan).toPromise();
         for (const item of resReqPl.items) {
            if (loopC) break
            const ccit = item['CCIT']
            const fdat = item['FDAT']
            const re: IMIRequest = {
               program: 'RPS045MI',
               transaction: 'LstItems',
               record: {
                  WHLO: this.varWHLO,
                  CCIT: ccit,
                  FDAT: fdat
               },
               outputFields: ['ITNO'],
               maxReturnedRecords: 0,
            };
            try {
               const resP = await this.miService.execute(re).toPromise();
               for (const it of resP.items) {
                  if (it['ITNO'] === this.varITNO) {
                     plan_item = ccit
                     loopC = true
                     break;
                  }
               }
            } catch { }
         }
      } catch { }

      const itToUse = plan_item ? plan_item : this.varITNO
      const results = [];

      //Use MMS080MI.SelForcTrans to get forecast data if the test is not conclusive

      // START------------------------------------- MMS080MI.SelForcTrans/-------------------------------------

      const reqMMS080: IMIRequest = {
         program: 'MMS080MI',
         transaction: 'SelForcTrans',
         record: {
            FWHL: this.varWHLO,
            TWHL: this.varWHLO
         },
         maxReturnedRecords: 0,
      };

      try {
         const resMMS080 = await this.miService.execute(reqMMS080).toPromise();
         const { items } = resMMS080

         if (items.length > 0) {
            results.push(...items.filter(item => item.ITNO === itToUse && item.CONO == this.cono && item.WHLO === this.varWHLO).map(item => ({
               PLDT: item.PLDT,
               TYPE: this.i18n.t('Forecast'),
               ORQA: parseFloat(item.RNQT),
               DWDT: item.PLDT
            })).filter(res => res.ORQA > 0))
         }
      } catch { }

      // END ------------------------------------- MMS080MI.SelForcTrans/-------------------------------------

      // const req: IMIRequest = {
      //    program: 'EXPORTMI',
      //    transaction: 'Select',
      //    record: {
      //       SEPC: ';',
      //       QERY: `FDFODY, FDDFOR from MITDFO where FDWHLO = '${this.varWHLO}' and FDITNO = '${itToUse}' and FDFODY >= '${formatedDate}'`,
      //    },
      //    maxReturnedRecords: 0,
      // };


      // try {
      //    const response = await this.miService.execute(req).toPromise();
      //    const tmp = response.items.sort((a, b) => {
      //       const aDate = a['REPL'].split(';')[0];
      //       const bDate = b['REPL'].split(';')[0];
      //       return Number(aDate) - Number(bDate);
      //    }).reduce((acc, item) => {
      //       if (acc.length === 0) {
      //          return [{
      //             PLDT: item['REPL'].split(';')[0],
      //             TYPE: this.i18n.t('Forecast'),
      //             ORQA: parseFloat(item['REPL'].split(';')[1]),
      //             DWDT: item['REPL'].split(';')[0]
      //          }]
      //       } else {
      //          if (acc[acc.length - 1].PLDT.substring(0, 6) === item['REPL'].split(';')[0].substring(0, 6)) {
      //             const tmp = acc
      //             tmp[tmp.length - 1].ORQA += parseFloat(item['REPL'].split(';')[1]);
      //             return tmp;
      //          } else {
      //             return [...acc, {
      //                PLDT: item['REPL'].split(';')[0],
      //                TYPE: this.i18n.t('Forecast'),
      //                ORQA: parseFloat(item['REPL'].split(';')[1]),
      //                DWDT: item['REPL'].split(';')[0]
      //             }]
      //          }
      //       }
      //    }, [])

      //    const req2: IMIRequest = {
      //       program: 'MMS080MI',
      //       transaction: 'LstMtPlByItmWhs',
      //       record: {
      //          WHLO: this.varWHLO,
      //          ITNO: itToUse
      //       },
      //       outputFields: ['PLDT', 'REQT'],
      //       maxReturnedRecords: 0,
      //    };

      //    try {
      //       const response2 = await this.miService.execute(req2).toPromise();
      //       const resSum = response2.items.sort((a, b) => {
      //          const aDate = a['PLDT'];
      //          const bDate = b['PLDT'];
      //          return Number(aDate) - Number(bDate);
      //       }).reduce((acc, item) => {
      //          if (acc.length === 0) {
      //             return [{
      //                PLDT: item['PLDT'].substring(0, 6),
      //                REQT: parseFloat(item['REQT'])
      //             }]
      //          } else {
      //             if (acc[acc.length - 1].PLDT === item['PLDT'].split(';')[0].substring(0, 6)) {
      //                const tmp = acc
      //                tmp[tmp.length - 1].REQT += parseFloat(item['REQT']);
      //                return tmp;
      //             } else {
      //                return [...acc, {
      //                   PLDT: item['PLDT'].substring(0, 6),
      //                   REQT: parseFloat(item['REQT'])
      //                }]
      //             }
      //          }
      //       }, [])

      //       results.push(...tmp.reduce((acc, item) => {
      //          const found = resSum.find(res => res.PLDT === item.PLDT.substring(0, 6));
      //          if (found) {
      //             return [...acc, {
      //                PLDT: item.PLDT,
      //                TYPE: item.TYPE,
      //                ORQA: item.ORQA - found.REQT,
      //                DWDT: item.DWDT
      //             }];
      //          } else {
      //             return [...acc, item];
      //          }
      //       }, []))
      //       results.forEach((res, idx) => {
      //          if (res.ORQA <= 0) results.splice(idx, 1)
      //       })
      //    } catch (error) {
      //       console.error('Error fetching reserved quantity:', error);
      //    }


      // } catch (error) {
      //    console.error('Error fetching forecast data:', error);
      // }
      return results;
   }


   private async getOis302Data() {
      const req: IMIRequest = {
         program: 'EXPORTMI',
         transaction: 'Select',
         record: {
            SEPC: ';',
            QERY: `OBITNO, OBCODT, OBORST, OBORNO, OBPONR, OBPOSX, OBWHLO, OBCUOR, OBCUNO, OBORQT, OBRNQT, OBALQT, OBPLQT, OBDLQT, OBIVQT, OBFACI from OOLINE where OBITNO = '${this.varITNO}' and OBWHLO = '${this.varWHLO}'`,
         },
         maxReturnedRecords: 0,
      };

      const results = []

      try {
         const res = await this.miService.execute(req).toPromise()
         const setStatus = (status) => {
            const st = status.substring(0, 1)
            if (st === '1') return `${status}-${this.i18n.t('preliminary')}`
            if (st === '2') return `${status}-${this.i18n.t('left_to_allocate')}`
            if (st === '3') return `${status}-${this.i18n.t('allocated')}`
            if (st === '4') return `${status}-${this.i18n.t('printed')}`
            if (st === '6') return `${status}-${this.i18n.t('delivered')}`
            if (st === '7') return `${status}-${this.i18n.t('invoiced')}`
            if (st === '9') return `${status}-${this.i18n.t('deleted')}`
            return status
         }
         const tmp = res.items.map((item) => {
            const [OBITNO, OBCODT, OBORST, OBORNO, OBPONR, OBPOSX, OBWHLO, OBCUOR, OBCUNO, OBORQT, OBRNQT, OBALQT, OBPLQT, OBDLQT, OBIVQT, OBFACI] = item['REPL'].split(';')
            return {
               OBITNO, OBCODT, OBORST: setStatus(OBORST), OBORNO, OBPONR, OBPOSX, OBWHLO, OBCUOR, OBCUNO, OBORQT, OBRNQT, OBALQT, OBPLQT, OBDLQT, OBIVQT, OBFACI
            }
         })
         results.push(...tmp)
      } catch { }
      return results
   }


   /**
    * @description Merges two arrays of data (forecast and customer orders) and sorts them by date.
    * @param fo Array of forecast data.
    * @param co Array of customer order data.
    * @returns Merged and sorted array of data.
    * @description The method combines the forecast and customer order data, sorts them by date, and returns the combined data.
    */
   private mixData(fo: any[], co: any[]) {
      const safeFo = Array.isArray(fo) ? fo : [];
      const safeCo = Array.isArray(co) ? co : [];
      const combinedData = []
      if (safeFo.length > 0) combinedData.push(...safeFo)
      if (safeCo.length > 0) combinedData.push(...safeCo)
      return combinedData.sort((a, b) => {
         return Number(a.PLDT) - Number(b.PLDT);
      });
   }

   /**
    *
    * @param items Array of items to calculate the balance.
    * @description Calculates the balance for each item based on the initial stock quantity and the ordered quantity.
    * The first item will have the initial stock quantity minus the ordered quantity, and subsequent items will have the balance from the previous item.
    * @returns
    */
   private calculateBalance(items: any[]) {
      return items.reduce((acc, item, idx, arr) => {
         return [...acc, {
            ...item,
            STQT: idx === 0 ? parseFloat(this.varSTQT) - parseFloat(item.ORQA) : parseFloat(acc[idx - 1].STQT) - parseFloat(item.ORQA)
         }]
      }, []);
   }

   openLookup(event: KeyboardEvent) {
      if (event.key === 'F4') {
         const target = event.target as HTMLElement;
         const lookup = target.nextElementSibling;
         if (lookup) {
            lookup.dispatchEvent(new Event('click'));
         }
      }
   }
}
