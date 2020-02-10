/* global d3 */
import debounce from 'lodash.debounce';
import isMobile from './utils/is-mobile';
import locate from './utils/locate';
import footer from './footer';
import annual from './annual';
import daily from './daily';
import reader from './reader';
// import { filter } from '../../../../../../../Library/Caches/typescript/3.6/node_modules/@types/minimatch';

const $body = d3.select('body');
const $readerButton = d3.select('.popup__submit');
const $readerOption = d3.select('.intro__user');
const $overlay = d3.select('.intro__overlay');
let previousWidth = 0;
// let readerLatLong = { latitude: 40, longitude: -72 };
const defaultLocation = {
  country_code: 'US',
  country_name: 'United States',
  region_code: 'NY',
  region_name: 'New York',
  city: 'New York',
  zip_code: '10001',
  time_zone: 'America/New_York',
  latitude: 40.7789,
  longitude: -73.9692,
};

function setupReaderOptions() {
  $overlay.classed('is-hidden', false);
}

function submitReaderChoice() {
  const userCity = d3.select('.user__city');
  const stationID = userCity.property('value');
  const stationCity = userCity
    .selectAll('option')
    .filter((d, i, n) => d3.select(n[i]).property('selected'))
    .attr('data-city');
  const details = { id: stationID, city: stationCity };
  d3.selectAll('.readerCity').text(stationCity);
  annual.init(details);
  daily.init(details);
  $overlay.classed('is-hidden', true);
}

function resize() {
  // only do resize on width changes, not height
  // (remove the conditional if you want to trigger on height change)
  const width = $body.node().offsetWidth;
  if (previousWidth !== width) {
    previousWidth = width;
    annual.resize();
    daily.resize();
  }
}

function setupStickyHeader() {
  const $header = $body.select('header');
  if ($header.classed('is-sticky')) {
    const $menu = $body.select('.header__menu');
    const $toggle = $body.select('.header__toggle');
    $toggle.on('click', () => {
      const visible = $menu.classed('is-visible');
      $menu.classed('is-visible', !visible);
      $toggle.classed('is-visible', !visible);
    });
  }
}

function findReaderLoc() {
  return new Promise((resolve, reject) => {
    const key = 'fd4d87f605681c0959c16d9164ab6a4a';
    locate(key, (err, result) => {
      const readerLatLong =
        err || result.country_code !== 'US'
          ? {
              latitude: defaultLocation.latitude,
              longitude: defaultLocation.longitude,
            }
          : { latitude: result.latitude, longitude: result.longitude };

      resolve(readerLatLong);
    });
  });
}

function init() {
  // add mobile class to body tag
  $body.classed('is-mobile', isMobile.any());
  // setup resize event
  window.addEventListener('resize', debounce(resize, 150));
  // setup sticky header menu
  setupStickyHeader();
  findReaderLoc();

  $readerButton.on('click', submitReaderChoice);
  $readerOption.on('click', setupReaderOptions);
  // load footer stories
  footer.init();
  // load graphics
  findReaderLoc()
    .then(reader)
    .then(station => {
      annual.init(station);
      daily.init(station);
    });
}

init();
