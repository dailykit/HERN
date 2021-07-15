const options = {
   cellVertAlign: 'middle',
   maxHeight: '420px',
   layout: 'fitColumns',
   autoResize: true,
   resizableColumns: true,
   virtualDomBuffer: 80,
   placeholder: 'No Data Available',
   persistence: true,
   persistenceID: 'customer_table',
   persistence: {
      group: false,
      sort: true, //persist column sorting
      filter: true, //persist filter sorting
      page: true, //persist page
      columns: true, //persist columns
   },
   persistenceMode: 'local',
   // pagination: 'local',
   // paginationSize: 10,
   downloadDataFormatter: data => data,
   downloadReady: (fileContents, blob) => blob,
}

export default options
