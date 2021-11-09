const options = {
    cellVertAlign: 'middle',
    autoResize: true,
    maxHeight: "62%",
    virtualDomBuffer: 80,
    placeholder: 'No Data Available',
    index: 'id',
    persistence: true,
    persistenceMode: 'local',
    selectablePersistence: true,
    persistence: {
       group: false,
       sort: true, //persist column sorting
       filter: true, //persist filter sorting
       page: true, //persist page
       columns: true, //persist columns
    },
    layout: 'fitDataStretch',
    resizableColumns: true,
   //  movableColumns: true,
    tooltips: true,
    downloadDataFormatter: data => data,
    downloadReady: (fileContents, blob) => blob,
 }
 
 export default options
 