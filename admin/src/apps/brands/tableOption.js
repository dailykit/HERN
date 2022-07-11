const options = {
   cellVertAlign: 'middle',
   maxHeight: 420,
   layout: 'fitColumns',
   autoResize: true,
   resizableColumns: true,
   virtualDomBuffer: 80,
   placeholder: 'No Data Available',
   persistence: true,
   persistence: {
      group: false,
      sort: true, //persist column sorting
      filter: true, //persist filter sorting
      page: true, //persist page
      columns: true, //persist columns
   },
   persistenceMode: 'local',
   downloadDataFormatter: data => data,
   downloadReady: (fileContents, blob) => blob,
}

export default options
