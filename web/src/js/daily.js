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
let condition = 'flat';

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
    const $parent = d3.select(this.parentNode);
    console.log($sel);

    const filtered = nested.filter(d => d.key === chartID)[0].values;

    $parent.select('h3').text(`${filtered[0].city}, ${filtered[0].state}`);

    const chart = $sel.data([filtered]).puddingDaily();

    chart.resize(largest).render('flat');
    charts.push(chart);
}

function setupReaderChart() {
    // find all station ids already shown
    const allStations = [];

    $containers.each(function (d) {
        const id = d3.select(this).attr('data-id');
        allStations.push(id);
    });

    // is reader location already shown?
    const alreadyShown = allStations.includes(readerStationDetails.id);

    // if already shown, hide it
    $figure
        .select('[data-id="reader"]')
        .classed('is-hidden', alreadyShown);

    $figure
        .select('.daily__city-name [data-id="reader"]')
        .text(readerStationDetails.city);
    const readerChart = $figure.selectAll('[data-id="reader"]');
    readerChart.attr('data-id', readerStationDetails.id);
}

function setupButtons() {
    $buttons.on('click', function (d) {
        const clicked = d3.select(this);
        condition = clicked.attr('data-condition');
        charts.forEach(chart => chart.render(condition));
    });

    //
}

function setup() {
    nestData();
    setupReaderChart();
    $containers.each(setupCharts);
    setupButtons();
}

function resize() {
    charts.forEach(chart => chart.resize(largest).render(condition));
}

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
