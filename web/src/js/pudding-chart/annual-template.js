/* global d3 */

/*
 USAGE (example: line chart)
 1. c+p this template to a new file (line.js)
 2. change puddingChartName to puddingChartLine
 3. in graphic file: import './pudding-chart/line'
 4a. const charts = d3.selectAll('.thing').data(data).puddingChartLine();
 4b. const chart = d3.select('.thing').datum(datum).puddingChartLine();
*/

d3.selection.prototype.puddingBar = function init(options) {
  function createChart(el) {
    // dom elements
    const $chart = d3.select(el);
    let $svg = null;
    let $axis = null;
    let $vis = null;

    // data
    let data = $chart.datum();
    console.log({ data });

    // dimensions
    let width = 0;
    let height = 0;
    const MARGIN_TOP = 0;
    const MARGIN_BOTTOM = 0;
    const MARGIN_LEFT = 16;
    const MARGIN_RIGHT = 16;
    const BAR_HEIGHT = 40;
    const PADDING = 0.1;
    const LOC_PADDING = 150;
    const FONT_SIZE = 16;
    const TRANSITION_SPEED = 500;

    // scales
    const scaleX = d3.scaleLinear();
    const scaleY = d3.scaleBand();

    // helper functions
    const formatThousands = d3.format(',d');

    const Chart = {
      // called once at start
      init() {
        $svg = $chart.append('svg').attr('class', 'annual__svg');

        // create axis
        $axis = $svg.append('g').attr('class', 'g-axis');

        // setup viz group
        $vis = $svg.append('g').attr('class', 'g-vis');
      },
      // on resize, update new dimensions
      resize(index) {
        // defaults to grabbing dimensions from container element
        width = $chart.node().offsetWidth - MARGIN_LEFT - MARGIN_RIGHT;
        height = $chart.node().offsetHeight - MARGIN_TOP - MARGIN_BOTTOM;
        $svg
          .attr('width', width + MARGIN_LEFT + MARGIN_RIGHT)
          .attr('height', height + MARGIN_TOP + MARGIN_BOTTOM);
        const totals =
          index === 3 ? data.map(d => d.average) : data.map(d => d.total19);
        const max = d3.max(totals);
        scaleX.domain([0, max]).range([0, width - LOC_PADDING]);
        scaleY
          .domain(d3.range(0, 12))
          .range([0, height])
          .padding(PADDING);

        return Chart;
      },
      // update scales and render chart
      render({ index, rankMap }) {
        console.log({ index, rankMap });
        // offset chart for margins
        $vis.attr('transform', `translate(${MARGIN_LEFT}, ${MARGIN_TOP})`);
        console.log('running');

        const $groups = $vis
          .selectAll('.g-location')
          .data(data, d => d.id)
          .join(
            enter =>
              enter
                .append('g')
                .attr('class', 'g-location')
                .attr('transform', (d, i) => `translate(0, ${scaleY(i)})`),
            update =>
              update
                .transition()
                .duration(TRANSITION_SPEED)
                // .delay((d, i) => i * 50)
                .attr('transform', (d, i) => `translate(0, ${scaleY(i)})`)
          );

        $groups
          .selectAll('.bar')
          .data(d => [d])
          .join(enter =>
            enter.append('rect').attr('class', d => `bar bar-${d.id}`)
          )
          .attr('x', LOC_PADDING)
          .attr('y', 0)
          .attr('height', BAR_HEIGHT)
          .transition()
          .duration(TRANSITION_SPEED)
          // .delay((d, i) => i * 100)
          .attr('width', d =>
            index === 3 ? scaleX(d.average) : scaleX(d.total19)
          );

        $groups
          .selectAll('.location')
          .data(d => [d])
          .join(enter => enter.append('text').attr('class', 'location'))
          .text(d =>
            index >= 2
              ? `${rankMap.get(d.id) + 1}. ${d.city}, ${d.state}`
              : `${d.city}, ${d.state}`
          )
          .attr('alignment-baseline', 'middle')
          .attr(
            'transform',
            `translate(${LOC_PADDING - MARGIN_LEFT}, ${BAR_HEIGHT / 2})`
          )
          .attr('text-anchor', 'end');

        $groups
          .selectAll('.annual__amount')
          .data(d => [d])
          .join(enter => enter.append('text').attr('class', 'annual__amount'))
          .text(d =>
            index === 3
              ? `${formatThousands(d.average)} mm`
              : `${formatThousands(d.total19)} mm`
          )
          .attr('alignment-baseline', 'middle')
          .attr('transform', d =>
            index === 3
              ? `translate(${scaleX(d.average) +
                  LOC_PADDING -
                  MARGIN_RIGHT}, ${BAR_HEIGHT / 2})`
              : `translate(${scaleX(d.total19) +
                  LOC_PADDING -
                  MARGIN_RIGHT}, ${BAR_HEIGHT / 2})`
          )
          .attr('text-anchor', 'end');

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
