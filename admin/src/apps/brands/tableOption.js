const options = {
   cellVertAlign: 'middle',
   layout: 'fitColumns',
   autoResize: true,
   maxHeight: 420,
   resizableColumns: false,
   virtualDomBuffer: 80,
   placeholder: 'No Data Available',
   persistence: false,
   persistenceMode: 'cookie',
   downloadDataFormatter: data => data,
   downloadReady: (fileContents, blob) => blob,
}

export default options
