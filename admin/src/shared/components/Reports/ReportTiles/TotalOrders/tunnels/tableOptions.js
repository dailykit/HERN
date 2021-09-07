const options = {
   cellVertAlign: 'middle',
   //    layout: 'fitColumns',
   autoResize: true,
   maxHeight: 420,
   resizableColumns: false,
   virtualDomBuffer: 20,
   placeholder: 'No Data Available',
   index: 'id',
   layout: 'fitDataStretch',
   resizableColumns: true,
   movableColumns: true,
   tooltips: true,
   downloadDataFormatter: data => data,
   downloadReady: (fileContents, blob) => blob,
}

export default options
