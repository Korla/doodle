import getData from './getData';
import getPointLines from './getPointLines';
import getCrossLines from './getCrossLines';
import getCurves from './getCurves';
import makeDataDriver from './dataDriver';
import {addPos, rgbToHex, getKey} from './utils';

import Rx from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver, h, svg} from '@cycle/dom';

function main(sources) {
  var pointClicks$ = sources.DOM.select('.point').events('click')
    .map(event =>
      event.target.attributes.data.value.split(',').map(intString => parseInt(intString, 10)
    ));

  var state$ = sources.data
    .merge(pointClicks$)
    .scan((state, point) => {
      var i = (point[1] - 1) * state.rowLength + point[0] - 1;
      state.points[i] = state.points[i] ? 0 : 1;
      return state;
    })
    .map(data => {
      var points = getData(data);
      var pointLines = getPointLines(points.filter(p => p.exists));
      var crossLines = getCrossLines(points.filter(p => !p.exists));
      var curves = getCurves(points.filter(p => p.exists));
      return {
        points,
        lines: pointLines.concat(crossLines).concat(curves)
      }
    })
  ;

  var view$ = state$.map(state => {
    var circles = state.points.map(p =>
      svg(
        'circle',
        {
          'cx': p.pos[0],
          'cy': p.pos[1],
          'r': 1,
          'class': 'point',
          'stroke-width': 3,
          'stroke': 'transparent',
          //'fill': rgbToHex(255, p.pos[0]*2.55, p.pos[1]*2.55),
          'fill': 'none',
          'attributes': {
            'data': p.coords.join(',')
          },
        }
      )
    );
    var lines = state.lines
      .map(l => svg(
          'path',
          {
            'stroke-width': 0.4,
            'stroke': 'red',
            'fill': 'none',
            'stroke': l.col,
            'd': 'M' + l.positions.map(pos => `${pos[0]} ${pos[1]} `) + 'Z'
          }
        )
      )
    ;
    return svg(
      'svg',
      {class: 'container', attributes: { width: '400', height: '400', viewBox: '0 0 100 100' }},
      lines.concat(circles)
    );
  })

  return {
    DOM: view$
  };
}

const drivers = {
  DOM: makeDOMDriver('body'),
  data: makeDataDriver('r6'),
};

Cycle.run(main, drivers);

function log(prefix) {
  return (data) => {
    console.log(prefix, data);
    return data;
  }
}
