import d3 from 'd3';
import getData from './getData';
import getPointLines from './getPointLines';
import getCrossLines from './getCrossLines';
import getCurves from './getCurves';
import {addPos, rgbToHex, getKey} from './utils'
import {r6} from './data';

import Rx from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver, h, svg} from '@cycle/dom';

function main(sources) {
  var data = getData(r6);

  var pointClicks$ = sources.DOM.select('.point').events('click')
    .map(event => event.target.attributes.data.value.split(','))
    .map(intString => parseInt(intString, 10));

  var state$ = Rx.Observable.of(r6)
    .merge(pointClicks$)
    .scan((state, point) => {
      var i = (point[1] - 1) * state.rowLength + point[0] - 1;
      state.points[i] = state.points[i] ? 0 : 1;
      return state;
    });

  let data$ = state$
    .map(data => {
      var points = getData(data);
      var pointLines = getPointLines(points.filter(p => p.exists));
      var crossLines = getCrossLines(points.filter(p => !p.exists));
      var curves = getCurves(points.filter(p => p.exists));
      return {
        points,
        lines: pointLines.concat(crossLines).concat(curves)
      }
    });

  let container$ = sources.DOM.select('.container').observable.map(elem => elem[0]);

  return {
    DOM: state$.map(state => svg('svg', {class: 'container', attributes: { width: '400', height: '400', viewBox: '0 0 100 100' }})),
    lineDriver: Rx.Observable.combineLatest(
      container$, data$.map(data => data.lines),
      (container, data) => ({container, data})),
    pointDriver: Rx.Observable.combineLatest(
      container$, data$.map(data => data.points),
      (container, data) => ({container, data})),
  };
}

const drivers = {
  DOM: makeDOMDriver('body'),
  log: (input$) => input$.subscribe(val => console.log(val)),
  lineDriver: (input$) => input$.subscribe(drawLines),
  pointDriver: (input$) => input$.subscribe(drawPoints),
};

Cycle.run(main, drivers);



function drawPoints({container, data}) {
  d3.select(container)
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', p => p.pos[0])
    .attr('cy', p => p.pos[1])
    .attr('r', 1)
    .attr('class', 'point')
    .attr('stroke-width', 3)
    .attr('stroke', 'transparent')
    .attr('fill', p => rgbToHex(255, p.pos[0]*2.55, p.pos[1]*2.55))
    .attr('data', p => p.coords.join(','))
  ;
}

function drawLines({container, data}) {
  var lineFunction = d3.svg.line()
    .x(p => p[0])
    .y(p => p[1])
    .interpolate('bezier');

  d3.select(container)
    .selectAll('path')
    .data(data)
    .enter()
    .append('path')
    .attr('d', d => lineFunction(d.positions))
    .attr('stroke-width', 0.4)
    .attr('pointer-events', 'all')
    .attr('stroke', d => d.col)
    .attr('fill', 'none');
}
