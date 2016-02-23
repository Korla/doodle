import d3 from 'd3';
import getData from './getData';
import getPointLines from './getPointLines';
import getCrossLines from './getCrossLines';
import getCurves from './getCurves';
import {addPos, rgbToHex, getKey} from './utils'
import {r6} from './data';

import Rx from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';

function main(drivers) {
  var data = getData(r6);
  var points = data.filter(p => p.exists);
  var pointLines = getPointLines(data.filter(p => p.exists));
  var crossLines = getCrossLines(data.filter(p => !p.exists));
  var curves = getCurves(data.filter(p => p.exists));

  let state$ = Rx.Observable.just({
    points,
    lines: pointLines.concat(crossLines).concat(curves)
  });
  let container$ = drivers.DOM.select('.container').observable.map(elem => elem[0]);
  let view$ = state$
    .map(state => h('svg', {className: 'container', attributes: { width: '400', height: '400', viewBox: '0 0 100 100' }}));

  return {
    DOM: view$,
    pointDriver: Rx.Observable.combineLatest(
      container$, state$,
      (container, data) => ({container, data: data.points})),
    lineDriver: Rx.Observable.combineLatest(
      container$, state$,
      (container, data) => ({container, data: data.lines})),
  };
}

const drivers = {
  DOM: makeDOMDriver('body'),
  log: (input$) => input$.subscribe(val => console.log(val)),
  pointDriver: (input$) => input$.subscribe(drawPoints),
  lineDriver: (input$) => input$.subscribe(drawLines)
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
    .attr('r', 0.5)
    .attr('fill', p => rgbToHex(255, p.pos[0]*2.55, p.pos[1]*2.55))
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
