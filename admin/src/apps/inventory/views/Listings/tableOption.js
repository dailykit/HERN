const options = {
   cellVertAlign: 'middle',
   layout: 'fitDataStretch',
   autoResize: true,
   maxHeight: '420px',
   resizableColumns: true,
   virtualDomBuffer: 80,
   placeholder: 'No Data Available',
   persistence: false,
   persistenceMode: 'cookie',
   tooltips: true,
   downloadDataFormatter: data => data,
   downloadReady: (fileContents, blob) => blob,
}

export default options
