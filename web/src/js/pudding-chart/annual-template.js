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
    const $axis = null;
    let $vis = null;

    // data
    let data = $chart.datum();

    // colors
    const seattleColor = '#A7435C';
    const readerColor = '#342A4E';
    const defaultColor = '#543F61';

    // dimensions
    let width = 0;
    let height = 0;
    const MARGIN_TOP = 0;
    const MARGIN_BOTTOM = 0;
    const MARGIN_LEFT = 8;
    const MARGIN_RIGHT = 8;
    let BAR_HEIGHT = 20;
    const PADDING = 0.2;
    const LOC_PADDING = 200;
    const FONT_SIZE = 16;
    const TRANSITION_SPEED = 500;

    // scales
    const scaleX = d3.scaleLinear();
    const scaleY = d3.scaleBand();

    // helper functions
    const formatThousands = d3.format(',d');

    function truncateString(string, len) {
      const sub = string.substr(0, len - 1);
      // truncate on word boundaries
      return string.length > len
        ? `${string.substr(0, sub.lastIndexOf(' '))}...`
        : string;
    }

    const Chart = {
      // called once at start
      init() {
        $svg = $chart.select('.annual__svg');

        // // create axis
        // $axis = $svg.append('g').attr('class', 'g-axis');

        if ($svg.select('.g-vis')) {
          const $g = $svg.select('.g-vis').remove();
        }
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

        BAR_HEIGHT = scaleY.bandwidth();

        return Chart;
      },
      // update scales and render chart
      render({ index, rankMap, readerStationID }) {
        $vis.attr('transform', `translate(${MARGIN_LEFT}, ${MARGIN_TOP})`);

        // add groups and move them to correct y location
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

        // add bars to each group
        $groups
          .selectAll('.bar')
          .data(d => [d])
          .join(enter =>
            enter.append('rect').attr('class', d => `bar bar-${d.id}`)
          )
          .attr('x', LOC_PADDING)
          .attr('y', 0)
          .attr('height', BAR_HEIGHT)
          .style('fill', d => {
            if (d.id === 'USW00094290') return seattleColor;
            if (d.id === readerStationID) return readerColor;
            return defaultColor;
          })
          .transition()
          .duration(TRANSITION_SPEED)
          // .delay((d, i) => i * 100)
          .attr('width', d =>
            index === 3 ? scaleX(d.average) : scaleX(d.total19)
          );

        // add location titles to each group
        $groups
          .selectAll('.location')
          .data(d => [d])
          .join(enter => enter.append('text').attr('class', 'location'))
          .text(d =>
            index >= 2
              ? `${rankMap.get(d.id) + 1}. ${truncateString(d.city, 15)}, ${
              d.state
              }`
              : `${d.city}, ${d.state}`
          )
          .attr('alignment-baseline', 'middle')
          .attr(
            'transform',
            `translate(${LOC_PADDING - MARGIN_LEFT}, ${BAR_HEIGHT / 2})`
          )
          .attr('text-anchor', 'end');

        // add amount annotation to each group
        $groups
          .selectAll('.annual__amount')
          .data(d => [d])
          .join(enter => enter.append('text').attr('class', 'annual__amount'))
          .text(d =>
            index === 3
              ? `${formatThousands(d.average)} in`
              : `${formatThousands(d.total19)} in`
          )
          .attr('alignment-baseline', 'middle')
          .attr('transform', d => {
            const barWidth =
              index === 3 ? scaleX(d.average) : scaleX(d.total19);
            const extra = barWidth < 50 ? FONT_SIZE : 0;

            const movement =
              index === 3
                ? `translate(${scaleX(d.average) +
                LOC_PADDING -
                MARGIN_RIGHT +
                extra}, ${BAR_HEIGHT / 2})`
                : `translate(${scaleX(d.total19) +
                LOC_PADDING -
                MARGIN_RIGHT +
                extra}, ${BAR_HEIGHT / 2})`;

            return movement;
          })
          .attr('text-anchor', d => {
            const barWidth =
              index === 3 ? scaleX(d.average) : scaleX(d.total19);
            if (barWidth < 50) return 'start';
            return 'end';
          })
          .classed('outside', d => {
            const barWidth =
              index === 3 ? scaleX(d.average) : scaleX(d.total19);
            return barWidth < 50;
          });
        let checkTopBar = null;
        let checkBottomBar = null;

        if (index >= 2) {
          const firstAdd = rankMap.get(data[10].id) + 1;
          let secondAdd = null;
          if (data.length > 11) secondAdd = rankMap.get(data[11].id) + 1;

          checkTopBar = firstAdd === 11;
          checkBottomBar =
            secondAdd === 12 ||
            secondAdd === firstAdd + 1 ||
            secondAdd === null;
        }

        // add dotted lines for broken graphic
        // figure out where the midpoint between the bars would be
        const barAdj = Math.round((scaleY.step() - scaleY.bandwidth()) / 2);
        $vis
          .selectAll('.break')
          .data([0, 1])
          .join(enter =>
            enter.append('line').attr('class', (d, i) => `break break-${i}`)
          )
          .attr('y1', d =>
            d === 0 ? scaleY(10) - barAdj : scaleY(11) - barAdj
          )
          .attr('y2', d =>
            d === 0 ? scaleY(10) - barAdj : scaleY(11) - barAdj
          )
          .attr('x1', 0)
          .attr('x2', width)
          .classed(
            'is-hidden',
            d =>
              index < 2 ||
              (d === 0 && checkTopBar) ||
              (d === 1 && checkBottomBar)
          );

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
