// BRINGING IN THE NEEDED FUNCTIONS/DATA
const header = require('./helpers/fun');
const { mainApp } = require('./helpers/app')

// INITIALIZES THE PROGRAM
const init = () => { console.clear(); console.log('\x1b[31m%s\x1b[0m', header); mainApp(); };

init();