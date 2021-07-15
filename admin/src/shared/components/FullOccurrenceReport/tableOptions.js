const options = {
   cellVertAlign: 'middle',
   maxHeight: '429px',
   layout: 'fitColumns',
   autoResize: true,
   resizableColumns: true,
   virtualDomBuffer: 80,
   placeholder: 'No Data Available',
   persistence: true,
   persistenceID: 'full_occurrence_table',
   persistence: {
      group: false,
      sort: true, //persist column sorting
      filter: true, //persist filter sorting
      page: true, //persist page
      columns: false, //persist columns
   },
   persistenceMode: 'local',
   // pagination: 'local',
   // paginationSize: 10,
   downloadDataFormatter: data => data,
   downloadReady: (fileContents, blob) => blob,
}

export default options
