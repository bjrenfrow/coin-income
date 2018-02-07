const axios = require('axios');
const csv = require('csvjson')
const fs = require('fs');
const moment = require('moment');
const program = require('commander');
const R = require('ramda');
const { promisify } = require('util');

const DATE_FORMAT = 'YYYY-MM-DD';

const asyncReadFile = promisify(fs.readFile);
const asyncWriteFile = promisify(fs.writeFile);

const {
  coinmarketApi,
  filterMiningDataByYear,
  formatForCsv,
  generateDayToPriceMap,
  getTimeframeFromYear,
  parseUSDHistory,
} = require('./utils');

console.log('-- starting --');

(async () => {
  program
    .version('1.0.0')
    .usage('[options]')
    .option('-i, --input <file>', 'breakout csv')
    .option('-o, --output <file>', 'output csv')
    .option('-y, --year <n>', 'tax year')
    .parse(process.argv);
    
  const { input, output, year } = program;

  console.log('-- loading csv --');    
  const breakoutCSV = await asyncReadFile(input, { encoding: 'utf8' });
  const miningData = csv.toObject(breakoutCSV, { quote: '"' });
  const miningDataForYear = filterMiningDataByYear(miningData, year);    

  console.log('-- fetching data from coinmarket cap --');
  const { end, start } = getTimeframeFromYear(year)
  const results = await axios.get(coinmarketApi(start, end));
  const history = parseUSDHistory(results);
  
  console.log('-- generating price history --');
  const priceHistory = generateDayToPriceMap(history);
  
  console.log('-- generating output csv --');
  const file = csv.toCSV(formatForCsv({ priceHistory, miningData: miningDataForYear }))
  await asyncWriteFile(output, file);
})();
