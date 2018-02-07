const moment = require('moment');
const R = require('ramda');

const DATE_FORMAT = 'YYYY-MM-DD';

const parseUSDHistory = R.path(['data', 'price_usd']);

const coinmarketApi = (start, end) => 
  `https://graphs2.coinmarketcap.com/currencies/breakout/${start}/${end}/`;

const getTimeframeFromYear = R.compose(
  year => ({
    end: moment(year).endOf('year').valueOf(),
    start: moment(year).valueOf(),
  }),
  year => `${year}-01-01`,
);

const filterMiningDataByYear = (rows, year) =>
  R.filter(({ Date }) => moment(Date).year() === parseInt(year), rows);

const generateDayToPriceMap = (history) => R.compose(
  R.reduce((accum, [date, price]) => {
    accum[date] = price;
    return accum;
  }, {}),
  R.uniqBy(([date]) => date),
  R.map((data) => [moment(data[0]).format(DATE_FORMAT), data[1]])
)(history);

const formatForCsv = ({ priceHistory, miningData }) =>
  R.map(({ Amount, Date }) => {
    const units = parseInt(Amount);
    const date = moment(Date).format(DATE_FORMAT);
    const price = priceHistory[date] || 0;
    return { 
      date,
      income: price * units,
      price,
      units, 
    };
  })(miningData);
  
module.exports = {
  coinmarketApi,
  filterMiningDataByYear,
  formatForCsv,
  generateDayToPriceMap,
  getTimeframeFromYear,
  parseUSDHistory,
}
