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
    .map(event => event.target.attributes.data.value.split(',').map(intString => parseInt(intString, 10)))
    .map(point => state => {
      var i = (point[1] - 1) * state.rowLength + point[0] - 1;
      state.points[i] = state.points[i] ? 0 : 1;
      return state;
    })
  ;

  var addColumnClick$ = sources.DOM.select('.addColumn').events('click')
    .map(() => state => {
      for(var i = state.rowLength; i <= state.points.length; i += state.rowLength + 1) {
        state.points.splice(i, 0, 0);
      }
      state.rowLength += 1;
      return state;
    });

  var addRowClick$ = sources.DOM.select('.addRow').events('click')
    .map(() => state => {
      for(var i = 0; i < state.rowLength; i ++) {
        state.points.push(0);
      }
      return state;
    });

  var hexagonScale$ = sources.DOM.select('.hexagonScale').events('input')
    .map(e => e.target.value)
    .startWith(0.7)
    .map(value => state => {
      state.hexagonScale = value;
      return state;
    });

  var cornerScale$ = sources.DOM.select('.cornerScale').events('input')
    .map(e => e.target.value)
    .startWith(0.5)
    .map(value => state => {
      state.cornerScale = value;
      return state;
    });

  var state$ = sources.data.map(data => {
      data.hexagonScale = 0.5;
      data.cornerScale = 0.7;
      return data;
    })
    .merge(pointClicks$)
    .merge(addColumnClick$)
    .merge(addRowClick$)
    .merge(hexagonScale$)
    .merge(cornerScale$)
    .scan((state, mapper) => mapper(state))
    .map(data => {
      var points = getData(data);
      var pointLines = getPointLines(points.filter(p => p.exists), data.hexagonScale, data.cornerScale);
      var crossLines = getCrossLines(points.filter(p => !p.exists));
      var curves = getCurves(points.filter(p => p.exists));
      return {
        hexagonScale: data.hexagonScale,
        cornerScale: data.cornerScale,
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

    return h('div', [
      svg(
        'svg',
        {class: 'container', attributes: { width: '400', height: '400', viewBox: '0 0 100 100' }},
        lines.concat(circles)
      ),
      h('div', [
        h('button', {className: 'addColumn'}, 'Add column'),
        h('button', {className: 'addRow'}, 'Add row'),
        h('div', [
          'Hexagon scale',
          h('input', {className: 'hexagonScale', value: state.hexagonScale, type: 'range', min: 0, max: 1, step: 0.01}, 'Add row'),
        ]),
        h('div', [
          'Corner scale',
          h('input', {className: 'cornerScale', value: state.cornerScale, type: 'range', min: 0, max: 1, step: 0.01}, 'Add row'),
        ])
      ])
    ]);
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
