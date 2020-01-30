import scrollama from 'scrollama';
import loadData from './load-data';
import 'intersection-observer';
import './pudding-chart/annual-template';

const scroller = scrollama();

// selections
const $section = d3.select('.annual');
const $container = $section.select('figure');
const $svg = $container.select('svg');
const $steps = $section.selectAll('.step');
const $titleLoc = d3.select('.readerCity');

// constants
let data = null;
let readerStationDetails = null;
const locationDistance = null;
let readerStationID = null;
const inSeattle = false;
const readerCity = null;
let stepIDs = null;
let chart = null;
const SEATTLE = 'USW00094290';
const ORLANDO = 'USW00012815';
let rankMap = null;
let index = 0;

function setupStepIDs() {
  stepIDs = [
    {
      step: 0,
      ids: [SEATTLE, ORLANDO],
    },
    {
      step: 1,
      ids: [SEATTLE, ORLANDO],
    },
    {
      step: 2,
      ids: [SEATTLE],
    },
    {
      step: 3,
      ids: [SEATTLE],
    },
  ];
}

function setupStation() {
  readerStationID = readerStationDetails.id;

  // add the reader Station ID to the filtered data for steps 2 & 3
  stepIDs[1].ids.push(readerStationID);
  stepIDs[2].ids.push(readerStationID);
  stepIDs[3].ids.push(readerStationID);
}

function setupRankMap(index) {
  let ranks = null;
  if (index === 3) {
    ranks = data
      .sort((a, b) => d3.descending(a.average, b.average))
      .map((d, i) => [d.id, i]);
  } else {
    ranks = data
      .sort((a, b) => d3.descending(a.total19, b.total19))
      .map((d, i) => [d.id, i]);
  }

  rankMap = new Map(ranks);
}

function findWettest() {
  const wettest19 = data
    // .map(d => ({ ...d }))
    .sort((a, b) => d3.descending(a.total19, b.total19));
  const top1019 = wettest19.slice(0, 10).map(d => d.id);
  top1019.forEach(d => stepIDs[2].ids.push(d));

  const wettestOverall = data
    .map(d => ({ ...d }))
    .sort((a, b) => d3.descending(a.average, b.average));
  const top10Overall = wettestOverall.slice(0, 10).map(d => d.id);
  top10Overall.forEach(d => stepIDs[3].ids.push(d));
}

function filterData(step) {
  const filtered = data.filter(d => stepIDs[step].ids.includes(d.id));
  if (step === 3) filtered.sort((a, b) => d3.descending(a.average, b.average));
  else filtered.sort((a, b) => d3.descending(a.total19, b.total19));
  return filtered;
}

function handleStepEnter(response) {
  index = response.index;
  const filtered = filterData(index);
  setupRankMap(index);
  chart
    .data(filtered)
    .resize(index)
    .render({ index, rankMap });
}

function setupScroll() {
  scroller
    .setup({
      step: '.annual .step',
      offset: 0.7,
      debug: false,
    })
    .onStepEnter(handleStepEnter);
}

function setupChart() {
  const filtered = filterData(0);

  chart = $container.datum(filtered).puddingBar();
  chart.resize(0).render({ index: 0, rankMap });
}

function setup() {
  setupStepIDs();
  setupStation();
  findWettest();
  setupRankMap();
  setupChart();
  setupScroll();

  resize();
}

function cleanData(data) {
  const clean = data.map(d => ({
    ...d,
    latitude: +d.latitude,
    longitude: +d.longitude,
    average: +d.average,
    rank: +d.rank,
    total19: +d.total19,
    elevation: +d.elevation,
  }));

  return clean;
}

function resize() {
  // 1. update height of step elements
  const stepH = Math.floor(window.innerHeight * 0.75);

  $steps.style('height', `${stepH}px`);

  scroller.resize();
  chart.resize(index).render({ index, rankMap });
}

function init(station) {
  loadData('annual_precip.csv')
    .then(result => {
      data = cleanData(result);
      readerStationDetails = station;
      setup();
    })
    .catch(console.error);
}

export default { init, resize };
