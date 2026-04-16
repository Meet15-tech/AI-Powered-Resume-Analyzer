const pdfParse = require('pdf-parse');
console.log(Object.keys(pdfParse));
if (typeof pdfParse.default === 'function') {
    console.log('pdfParse.default is a function');
}
if (typeof pdfParse.PDFParse === 'function') {
    console.log('pdfParse.PDFParse is a function');
}
