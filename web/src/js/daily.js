import loadData from './load-data';
import './pudding-chart/daily-template';

// selections
const $section = d3.select('.daily');
const $figure = $section.select('figure');
const $containers = $figure.selectAll('.daily__container');
const charts = [];
const $buttons = $figure.selectAll('button');

let data = null;
let nested = null;
const parseDate = d3.timeParse('%Y-%m-%d');
let readerStationDetails = null;
let largest = null;

function cleanData(data) {
  const clean = data.map(d => ({
    ...d,
    date: parseDate(d.date),
    value: +d.value,
  }));

  return clean;
}

function nestData() {
  nested = d3
    .nest()
    .key(d => d.id)
    .entries(data);

  largest = d3.max(data, d => d.value);
}

function setupCharts() {
  const $sel = d3.select(this);
  const chartID = $sel.attr('data-id');

  const filtered = nested.filter(d => d.key === chartID)[0].values;

  const chart = $sel.data([filtered]).puddingDaily();

  chart.resize(largest).render('flat');
  charts.push(chart);
}

function setupReaderChart() {
  $figure.select('[data-id="reader"]').text(readerStationDetails.city);
  const readerChart = $figure.selectAll('[data-id="reader"]');
  readerChart.attr('data-id', readerStationDetails.id);
}

function setupButtons() {
  $buttons.on('click', function(d) {
    const clicked = d3.select(this);
    const condition = clicked.attr('data-condition');
    charts.forEach(chart => chart.render(condition));
    console.log({ condition });
  });

  //
}

function setup() {
  nestData();
  setupReaderChart();
  $containers.each(setupCharts);
  setupButtons();
}

function resize() {}

function init(station) {
  loadData('daily_precip.csv')
    .then(result => {
      data = cleanData(result);
      readerStationDetails = station;
      setup();
    })
    .catch(console.error);
}

export default { init, resize };
