const axios = require('axios');
const moment = require('moment');
const program = require('commander');
const R = require('ramda');

const parseUSDHistory = R.path(['data', 'price_usd']);

const coinmarketApi = (start, end) => 
  `https://graphs2.coinmarketcap.com/currencies/breakout/${start}/${end}/`;

const getTimeframeFromYear = R.compose(
  year => ({
    end: year.endOf('year').valueOf(),
    start: year.valueOf(),
  }),
  year => moment(`${program.year}-01-01`),
);

console.log('-- starting --');

(async () => {
  program
    .version('1.0.0')
    .option('-f, --file <file>', 'breakout csv')
    .option('-y, --year <year>', 'tax year')
    .parse(process.argv);
    
  const { end, start } = getTimeframeFromYear(program.year)
    
  // const results = await axios.get(coinmarketApi(1508068553444, 1517900050000));
  // const history = parseUSDHistory(results);
  
  // console.log({ history });
    
})();
