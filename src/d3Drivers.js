import d3 from 'd3';
import {addPos, rgbToHex, getKey} from './utils'

export function drawPointsDriver() {
  return (input$) => input$.subscribe(drawPoints);
}

export function drawLinesDriver() {
  return (input$) => input$.subscribe(drawLines);
}

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
