const options = {
   cellVertAlign: 'middle',
   // layout: 'fitColumns',
   autoResize: true,
   maxHeight: 420,
   resizableColumns: false,
   virtualDomBuffer: 20,
   persistenceID: 'earning_table',
   placeholder: 'No Data Available',
   index: 'id',
   persistence: false,
   persistenceMode: 'local',
   selectablePersistence: true,
   persistence: false,
   layout: 'fitDataStretch',
   resizableColumns: true,
   movableColumns: true,
   tooltips: true,
   downloadDataFormatter: data => data,
   downloadReady: (fileContents, blob) => blob,
}

export default options
