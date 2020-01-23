import { setupMaster } from 'cluster';
import loadData from './load-data';

// constants
let data = null;
let readerLatLong = null;
let locationDistance = null;
let readerStation = null;

function calculatingDistance(readerLat, readerLong, locLat, locLong) {
  // Haversine Formula
  function toRadians(value) {
    return (value * Math.PI) / 180;
  }

  const R = 6371e3; // metres
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
    }))
    .filter(d => !isNaN(d.distance));

  locationDistance.sort((a, b) => d3.descending(a.distance, b.distance));
  const location = locationDistance.pop();
  readerStation = location.id;
}

function setup() {
  findNearestStation();
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

function resize() {}

function init(readerLocation) {
  loadData('annual_precip.csv')
    .then(result => {
      data = cleanData(result);
      readerLatLong = readerLocation;
      setup();
      console.log({ data, readerLatLong });
    })
    .catch(console.error);
}

export default { init, resize };
