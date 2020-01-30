/* global d3 */

/*
 USAGE (example: line chart)
 1. c+p this template to a new file (line.js)
 2. change puddingChartName to puddingChartLine
 3. in graphic file: import './pudding-chart/line'
 4a. const charts = d3.selectAll('.thing').data(data).puddingChartLine();
 4b. const chart = d3.select('.thing').datum(datum).puddingChartLine();
*/

d3.selection.prototype.puddingDaily = function init(options) {
    function createChart(el) {
        // dom elements
        const $chart = d3.select(el);
        const $svg = null;
        let $axis = null;
        let $canvas = null;
        let $context = null;
        let $vis = null;

        // data
        let data = $chart.datum();
        let barData = null;

        // dimensions
        let width = 0;
        let height = 0;
        const MARGIN_TOP = 0;
        const MARGIN_BOTTOM = 0;
        const MARGIN_LEFT = 0;
        const MARGIN_RIGHT = 0;
        const DPR = window.devicePixelRatio
            ? Math.min(window.devicePixelRatio, 2)
            : 1;
        const PADDING = 0.1
        const defaultHeight = 20
        const DURATION = 500
        const EASE = d3.easeCubic;
        let timer = null
        let RECT_WIDTH = null
        const dark = '#342A4E'
        const light = '#B19ED3'


        // scales
        const scaleX = d3.scaleTime();
        const scaleY = d3.scaleLinear();

        const axisLabels = [{
            month: 'Jan',
            date: new Date(2019, 0, 15)
        },
        {
            month: 'Feb',
            date: new Date(2019, 1, 14)
        },
        {
            month: 'Mar',
            date: new Date(2019, 2, 15)
        },
        { month: 'Apr', date: new Date(2019, 3, 15) },
        { month: 'May', date: new Date(2019, 4, 15) },
        { month: 'Jun', date: new Date(2019, 5, 15) },
        { month: 'Jul', date: new Date(2019, 6, 15) },
        { month: 'Aug', date: new Date(2019, 7, 15) },
        { month: 'Sep', date: new Date(2019, 8, 15) },
        { month: 'Oct', date: new Date(2019, 9, 15) },
        { month: 'Nov', date: new Date(2019, 10, 15) },
        {
            month: 'Dec', date: new Date(2019, 11, 15)
        }]


        // helper functions
        function setupBarData(condition) {
            barData = data.map(d => ({ ...d }))
            barData.forEach(d => {
                // store the source height
                // if condition is flat, the starting position is staggered and needs to become flat
                d.sh = condition === 'flat' ? scaleY(d.value) : defaultHeight,
                    d.th = condition === 'flat' ? defaultHeight : scaleY(d.value)
            })

            timer = d3.timer(elapsed => {
                // compute how far through the animation we are
                const t = Math.min(1, EASE(elapsed / DURATION))

                // update bar height (interpolated between source & target)
                barData.forEach(bar => {
                    bar.h = bar.sh * (1 - t) + bar.th * t
                })

                renderBars()


                // if animation is over, stop timer
                if (t === 1) {
                    timer.stop()
                }
            })
        }
        function renderBars() {
            $context.clearRect(0, 0, width, height)
            barData.forEach(d => {
                //Drawing a rectangle
                $context.fillStyle = d.value > 0 ? dark : light
                $context.fillRect(scaleX(d.date), 0, RECT_WIDTH, d.h);

            })

            axisLabels.forEach(d => {
                $context.fillStyle = "red"
                $context.fillText(d.month, scaleX(d.date), 50)
            })
        }

        const Chart = {
            // called once at start
            init() {
                $canvas = $chart.append('canvas').attr('class', 'daily__canvas');
                $context = $canvas.node().getContext('2d');
            },
            // on resize, update new dimensions
            resize(largest) {
                // defaults to grabbing dimensions from container element
                width = ($chart.node().offsetWidth - MARGIN_LEFT - MARGIN_RIGHT) * DPR;
                height =
                    ($chart.node().offsetHeight - MARGIN_TOP - MARGIN_BOTTOM) * DPR;

                $canvas
                    .attr('width', width)
                    .attr('height', height)
                    .style('width', `${width / DPR}px`)
                    .style('height', `${height / DPR}px`);

                scaleX.domain([new Date(2019, 0, 01), new Date(2019, 11, 31)])
                    .range([0, width])

                scaleY.domain([0, largest]).range([0, 250])
                RECT_WIDTH = Math.round(width / 365)

                return Chart;
            },
            // update scales and render chart
            render(condition) {
                setupBarData(condition)

                return Chart;
            },
            // get / set data
            data(val) {
                if (!arguments.length) return data;
                data = val;
                $chart.datum(data);
                return Chart;
            },
        };
        Chart.init();

        return Chart;
    }

    // create charts
    const charts = this.nodes().map(createChart);
    return charts.length > 1 ? charts : charts.pop();
};
