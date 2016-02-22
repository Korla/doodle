import d3 from 'd3';
import getData from './src/getData';
import getPointLines from './src/getPointLines';
import getCrossLines from './src/getCrossLines';
import getCurves from './src/getCurves';
import {addPos, rgbToHex, getKey} from './src/utils'
import {r6} from './src/data';

import Rx from 'rx';
import Cycle from '@cycle/core';
import CycleDOM from '@cycle/dom';

function main() {
  return {
    DOM: Rx.Observable.interval(1000)
      .map(i => CycleDOM.h1('' + i + ' seconds elapsed'))
  };
}

const drivers = {
  DOM: CycleDOM.makeDOMDriver('body')
};

Cycle.run(main, drivers);



var data = getData(r6);
var pointLines = getPointLines(data.filter(p => p.exists));
var crossLines = getCrossLines(data.filter(p => !p.exists));
var curves = getCurves(data.filter(p => p.exists));

var svgContainer = d3.select('body')
  .append('svg')
  .attr('width', 400)
  .attr('height', 400)
  .attr('viewBox', '0 0 100 100');

drawPoints(data.filter(p => p.exists), svgContainer);
drawLines(svgContainer, pointLines, crossLines, curves);

function drawPoints(points, container){
  container
    .selectAll('circle')
    .data(points)
    .enter()
    .append('circle')
    .attr('cx', p => p.pos[0])
    .attr('cy', p => p.pos[1])
    .attr('r', 0.5)
    .attr('fill', p => rgbToHex(255, p.pos[0]*2.55, p.pos[1]*2.55))
  ;
}

function drawLines(container, ...data) {
  var lineData = data
    .reduce((prev, current) => prev.concat(current), []);
  var lineFunction = d3.svg.line()
    .x(p => p[0])
    .y(p => p[1])
    .interpolate('bezier');

  container.selectAll('path')
    .data(lineData)
    .enter()
    .append('path')
    .attr('d', d => lineFunction(d.positions))
    .attr('stroke-width', 0.4)
    .attr('pointer-events', 'all')
    .attr('stroke', d => d.col)
    .attr('fill', 'none');
}
