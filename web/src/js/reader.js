import { runInThisContext } from 'vm';
import loadData from './load-data';

const readerLocation = null;
const readerLatLong = null;
let data = null;

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
  console.log({ readerLocation });
  // is the reader within 50 miles of Seattle?
  // inSeattle = location.seattle <= 50;

  // // if within 50 miles of Seattle, compare to NYC, otherwise, use reader's location
  // readerStation = inSeattle ? 'USW00094728' : location.id;
  // readerCity = inSeattle ? 'New York City' : location.city;
  // $titleLoc.text(readerCity);
  // add the reader Station ID to the filtered data for steps 2 & 3
  // stepIDs[1].ids.push(readerStation);
  // stepIDs[2].ids.push(readerStation);
  // stepIDs[3].ids.push(readerStation);
}

export default function findLocation(reader) {
  return new Promise((resolve, reject) => {
    loadData('annual_precip.csv')
      .then(result => {
        data = cleanData(result);
        const loc = findNearestStation(reader);
        resolve(loc);
      })
      .catch(reject);
  });
}
