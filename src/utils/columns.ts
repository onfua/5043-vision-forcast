export const forecastColumns = (obj: any) => [
   {
      id: 'PRDT',
      name: obj.plan_date,
      field: 'PRDT',
      sortable: true,
      filterType: 'text',
      formatter: (row, cell, value, column, item) => {
         const date = value.toString();
         return `<a style=" color: #0066d4; text-decoration : underline; cursor : pointer">${date.substring(6, 8)}/${date.substring(4, 6)}/${date.substring(0, 4)}</a>`;
      },
      click : obj.clickPRDT,
      width: 90
   },
   {
      id: 'PRDTT',
      name: obj.reqDelDa,
      field: 'PRDTT',
      sortable: true,
      filterType: 'text',
      formatter: (row, cell, value, column, item) => {
         const date = value.toString();
         return `${date.substring(6, 8)}/${date.substring(4, 6)}/${date.substring(0, 4)}`;
      },
      width: 90
   },
   {
      id: 'TYPE',
      name: 'Type',
      field: 'TYPE',
      sortable: true,
      filterType: 'text',
      width: 150,
   },
   {
      id: 'CAMU',
      name: obj.qtyReq,
      field: 'CAMU',
      sortable: true,
      filterType: 'text',
      width: 100,
   },
   {
      id: 'WHSL',
      name: obj.allocated,
      field: 'WHSL',
      sortable: true,
      filterType: 'text',
      formatter: (row, cell, value, column, item) => {
         setTimeout(() => {
            $('#forecastDataGrid .datagrid-row:nth-child(' + (row + 1) + ') td:nth-child('+ (cell + 1) +')').css('text-align', 'center');
         }, 50);
         return value === '33' ? '✅' : '';
      },
      width: 70
   },
   {
      id: 'STQT',
      name: obj.balance,
      field: 'STQT',
      sortable: true,
      filterType: 'text',
      formatter: (row, cell, value, column, item) => {
         const output = value
         if (parseFloat(value) < 0) {
            setTimeout(() => {
               $('#forecastDataGrid .datagrid-row:nth-child(' + (row + 1) + ') .datagrid-cell-wrapper').css('background-color', '#ff9292ff');
            }, 50);

         } else {
            setTimeout(() => {
               $('#forecastDataGrid .datagrid-row:nth-child(' + (row + 1) + ') .datagrid-cell-wrapper').css({ 'background-color': '#90ff90ff' });
            }, 50);
         }
         return output;
      },
      width: 90
   },
   {
      id: 'PRTS',
      name: obj.customer,
      field: 'PRTS',
      sortable: true,
      filterType: 'text',
      width: 200
   },
   {
      id: 'ATV1',
      name: obj.CONumber,
      field: 'ATV1',
      sortable: true,
      filterType: 'text',
      formatter: (row, cell, value, column, item) => {
         if (value){
            return `<a style=" color: #0066d4; text-decoration : underline; cursor : pointer">${value}</a>`;
         }
         return value;
      },
      click : obj.clickORNO,
      width: 150
   },
   {
      id: 'ATV2',
      name: obj.COType,
      field: 'ATV2',
      sortable: true,
      filterType: 'text',
      width: 100
   }
];

export const ois302Columns = (obj: any) => [
   {
      id: 'ITNO',
      name: obj.item_number,
      field: 'ITNO',
      sortable: true,
      filterType: 'text',
      width: 120,
      formatter: (row, cell, value, column, item) => {
         if (value){
            return `<a style=" color: #0066d4; text-decoration : underline; cursor : pointer">${value}</a>`;
         }
         return value;
      },
      click : obj.clickITNO
   },
   {
      id: 'CODT',
      name: obj.CODT,
      field: 'CODT',
      sortable: true,
      filterType: 'text',
      formatter: (row, cell, value, column, item) => {
         const date = value.toString();
         return `${date.substring(6, 8)}/${date.substring(4, 6)}/${date.substring(0, 4)}`;
      },
      width: 90
   },
   {
      id: 'ORST',
      name: obj.HiS,
      field: 'ORST',
      sortable: true,
      filterType: 'text',
      width: 150,
      formatter: (row, cell, value, column, item) => {
         let color = '#ffffff'
         const val = value.substring(0,1)
         if (val === '1') color = '#ff65b2ff'
         if (val === '2') color = '#00d3c8ff'
         if (val === '3') color = '#b0ff31ff'
         if (val === '4') color = '#97b0ffff'
         if (val === '6') color = '#f6ff76ff'
         if (val === '7') color = '#b7d9ffff'
         if (val === '9') color = '#ffab4aff'
         return `
         <div style="background-color: ${color}; width: 140px;width: 140px;text-align: center;border-radius: 5px;font-weight: bold;">
            ${value}
         </div>`
      },
   },
   {
      id: 'ORNO',
      name: obj.CONumber,
      field: 'ORNO',
      sortable: true,
      filterType: 'text',
      width: 150,
      formatter: (row, cell, value, column, item) => {
         if (value){
            return `<a style=" color: #0066d4; text-decoration : underline; cursor : pointer">${value}</a>`;
         }
         return value;
      },
      click : obj.clickORNO
   },
   {
      id: 'PONR',
      name: obj.PONR,
      field: 'PONR',
      sortable: true,
      filterType: 'text',
      width: 70,
      // formatter: (row, cell, value, column, item) => {
      //    if (value){
      //       return `<a style=" color: #0066d4; text-decoration : underline; cursor : pointer">${value}</a>`;
      //    }
      //    return value;
      // },
      // click : obj.clickPONR
   },
   {
      id: 'POSX',
      name: obj.POSX,
      field: 'POSX',
      sortable: true,
      filterType: 'text',
      width: 70,
      formatter: (row, cell, value, column, item) => {
         if (value === "0"){
            return ``;
         }
         return value;
      },
   },
   {
      id: 'WHLO',
      name: obj.WHLO,
      field: 'WHLO',
      sortable: true,
      filterType: 'text',
      width: 70
   },
   {
      id: 'CUOR',
      name: obj.CUOR,
      field: 'CUOR',
      sortable: true,
      filterType: 'text',
      width: 120
   },
   {
      id: 'CUNO',
      name: obj.customer,
      field: 'CUNO',
      sortable: true,
      filterType: 'text',
      width: 120
   },
   {
      id: 'ORQT',
      name: obj.ORQT,
      field: 'ORQT',
      sortable: true,
      filterType: 'text',
      width: 100
   },
   {
      id: 'RNQT',
      name: obj.RNQT,
      field: 'RNQT',
      sortable: true,
      filterType: 'text',
      width: 100
   },
   {
      id: 'ALQT',
      name: obj.ALQT,
      field: 'ALQT',
      sortable: true,
      filterType: 'text',
      width: 100
   },
   {
      id: 'PLQT',
      name: obj.PLQT,
      field: 'PLQT',
      sortable: true,
      filterType: 'text',
      width: 100
   },
   {
      id: 'DLQT',
      name: obj.DLQT,
      field: 'DLQT',
      sortable: true,
      filterType: 'text',
      width: 100
   },
   {
      id: 'IVQT',
      name: obj.IVQT,
      field: 'IVQT',
      sortable: true,
      filterType: 'text',
      width: 100
   },
   {
      id: 'FACI',
      name: obj.FACI,
      field: 'FACI',
      sortable: true,
      filterType: 'text',
      width: 70
   }
];

export const whloColumns = (obj: any) => [
   {
      id: 'WHLO',
      name: obj.WHLO,
      field: 'WHLO',
      sortable: true,
      filterType: 'text',
   },
   {
      id: 'WHNM',
      name: obj.WHNM,
      field: 'WHNM',
      sortable: true,
      filterType: 'text',
   }
];

export const itnoColumns = (obj: any) => [
   {
      id: 'ITNO',
      name: obj.ITNO,
      field: 'ITNO',
      sortable: true,
      filterType: 'text',
   },
   {
      id: 'ITDS',
      name: obj.ITDS,
      field: 'ITDS',
      sortable: true,
      filterType: 'text',
   }
];
