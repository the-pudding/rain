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

// constants
let data = null;
let readerLatLong = null;
let locationDistance = null;
let readerStation = null;
let inSeattle = false;
let readerCity = null;
let stepIDs = null;
let chart = null;
const SEATTLE = 'USW00094290';
const ORLANDO = 'USW00012815';

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

function calculatingDistance(readerLat, readerLong, locLat, locLong) {
  // Haversine Formula
  function toRadians(value) {
    return (value * Math.PI) / 180;
  }

  const R = 3958.756; // miles
  const φ1 = toRadians(readerLat);
  const φ2 = toRadians(locLat);
  const Δφ = toRadians(locLat - readerLat);
  const Δλ = toRadians(locLong - readerLong);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function findNearestStation() {
  locationDistance = data
    .map(d => ({
      ...d,
      distance: calculatingDistance(
        readerLatLong.latitude,
        readerLatLong.longitude,
        +d.latitude,
        +d.longitude
      ),
      seattle: calculatingDistance(
        readerLatLong.latitude,
        readerLatLong.longitude,
        47.6872,
        -122.2553
      ),
    }))
    .filter(d => !isNaN(d.distance));

  locationDistance.sort((a, b) => d3.descending(a.distance, b.distance));
  const location = locationDistance.pop();
  // is the reader within 50 miles of Seattle?
  inSeattle = location.seattle <= 50;
  console.log({ inSeattle, sea: location.seattle });
  // if within 50 miles of Seattle, compare to NYC, otherwise, use reader's location
  readerStation = inSeattle ? 'USW00094728' : location.id;
  readerCity = location.city;
  // add the reader Station ID to the filtered data for steps 2 & 3
  stepIDs[1].ids.push(readerStation);
  stepIDs[2].ids.push(readerStation);
  stepIDs[3].ids.push(readerStation);
}

function findWettest() {
  // no overwriting original data when sorting
  const dataCopy = data.map(d => ({ ...d }));
  const wettest19 = dataCopy
    // .map(d => ({ ...d }))
    .sort((a, b) => d3.descending(a.total19, b.total19));
  const top1019 = wettest19.slice(0, 10).map(d => d.id);
  top1019.forEach(d => stepIDs[2].ids.push(d));
  console.log({ top1019 });

  const wettestOverall = data
    .map(d => ({ ...d }))
    .sort((a, b) => d3.descending(a.average, b.average));
  const top10Overall = wettestOverall.slice(0, 10).map(d => d.id);
  top10Overall.forEach(d => stepIDs[3].ids.push(d));
  console.log({ top1019, top10Overall, stepIDs });
}

function filterData(step) {
  const filtered = data.filter(d => stepIDs[step].ids.includes(d.id));
  if (step === 3) filtered.sort((a, b) => d3.descending(a.average, b.average));
  else filtered.sort((a, b) => d3.descending(a.total19, b.total19));
  return filtered;
}

function handleStepEnter(response) {
  const { index } = response;
  const filtered = filterData(index);
  console.log({ filtered });
  chart
    .data(filtered)
    .resize(index)
    .render(index);
}

function setupScroll() {
  scroller
    .setup({
      step: '.annual .step',
      offset: 0.7,
      debug: true,
    })
    .onStepEnter(handleStepEnter);
}

function setupChart() {
  const filtered = filterData(0);

  chart = $container.datum(filtered).puddingBar();
  chart.resize(0).render(0);
}

function setup() {
  setupStepIDs();
  findNearestStation();
  findWettest();
  setupChart();
  setupScroll();

  resize();

  console.log({ stepIDs });
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
}

function init(readerLocation) {
  loadData('annual_precip.csv')
    .then(result => {
      data = cleanData(result);
      readerLatLong = readerLocation;
      setup();
    })
    .catch(console.error);
}

export default { init, resize };
