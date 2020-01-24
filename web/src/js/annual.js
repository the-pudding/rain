import loadData from './load-data';
import './pudding-chart/annual-template';

// selections
const $section = d3.select('.annual');
const $container = $section.select('figure');
const $svg = $container.select('svg');

// constants
let data = null;
let readerLatLong = null;
let locationDistance = null;
let readerStation = null;
let readerCity = null;
let stepIDs = null;

function setupStepIDs() {
    stepIDs = [
        {
            step: 0,
            ids: ['USW00094290', 'USW00012815'],
        },
        {
            step: 1,
            ids: ['USW00094290', 'USW00012815', readerStation],
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
        }))
        .filter(d => !isNaN(d.distance));

    locationDistance.sort((a, b) => d3.descending(a.distance, b.distance));
    const location = locationDistance.pop();
    readerStation = location.id;
    readerCity = location.city;
}

function filterData(step) {
    return data.filter(d => stepIDs[step].ids.includes(d.id));
}

function setupChart() {
    const filtered = filterData(0);

    const chart = $container.datum(filtered).puddingBar()
    console.log({ filtered });
}

function setup() {
    findNearestStation();
    setupStepIDs();
    setupChart();

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

function resize() { }

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
