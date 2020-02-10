import { runInThisContext } from 'vm';
import loadData from './load-data';
import stateLookup from './utils/lookup-state-name';

const readerLocation = null;
const readerLatLong = null;
let data = null;
const $readerCityText = d3.selectAll('.readerCity');
const $cityDD = d3.select('.user__city');
let byState = null;

function cleanData(data) {
  const clean = data.map(d => ({
    ...d,
    latitude: +d.latitude,
    longitude: +d.longitude,
  }));

  return clean;
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

function findNearestStation(readerLatLong) {
  const locationDistance = data
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
  return locationDistance.pop();
}

function handleStateUpdate() {
  const sel = d3.select(this).attr('value');
  console.log({ sel });
  const justState = byState.filter();
}

function setupDropdowns() {
  // dropdowns will be filled in to allow readers the ability to change cities

  // nest data
  byState = d3
    .nest()
    .key(d => d.state)
    .sortKeys(d3.ascending)
    .sortValues((a, b) => d3.ascending(a.city, b.city))
    .entries(data);

  const $stateDD = d3.select('.user__state');

  $stateDD
    .selectAll('option')
    .data(byState, d => d.key)
    .join(enter =>
      enter
        .append('option')
        .text(d => stateLookup(d.key))
        .attr('value', d => d.key)
    );

  const ALASKA = byState.filter(d => d.key === 'AK')[0].values;
  $cityDD
    .selectAll('option')
    .data(ALASKA, d => d.id)
    .join(enter =>
      enter
        .append('option')
        .text(d => `${d.city} (${d.station} Station)`)
        .attr('value', d => d.id)
        .attr('data-city', d => d.city)
    );

  $stateDD.on('change', function change() {
    const state = d3.select(this).property('value');
    const onlyState = byState.filter(d => d.key === state)[0].values;

    $cityDD
      .selectAll('option')
      .data(onlyState, d => d.id)
      .join(enter =>
        enter
          .append('option')
          .text(d => `${d.city} (${d.station} Station)`)
          .attr('value', d => d.id)
          .attr('data-city', d => d.city)
      );
  });
}

export default function findLocation(reader) {
  return new Promise((resolve, reject) => {
    loadData('locations.csv')
      .then(result => {
        data = cleanData(result);
        const loc = findNearestStation(reader);

        // setup reader adjustment dropdowns
        setupDropdowns();

        // is the reader within 50 miles of Seattle?
        const inSeattle = loc.seattle <= 50;

        // if within 50 miles of Seattle, compare to NYC, otherwise, use reader's location
        const readerStationID = inSeattle ? 'USW00094728' : loc.id;
        const readerCity = inSeattle ? 'New York' : loc.city;
        $readerCityText.text(readerCity);

        resolve({ id: readerStationID, city: readerCity });
      })
      .catch(reject);
  });
}
