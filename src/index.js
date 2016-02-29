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
  var click = selector => sources.DOM.select(selector).events('click');

  var point$ = click('.point')
    .map(event => event.target.attributes.data.value.split(',').map(intString => parseInt(intString, 10)))
    .map(point => state => {
      var i = (point[1] - 1) * state.rowLength + point[0] - 1;
      state.points[i] = state.points[i] ? 0 : 1;
      return state;
    });

  var addColumn$ = click('.addColumn')
    .map(() => state => {
      for(var i = state.rowLength; i <= state.points.length; i += state.rowLength + 1) {
        state.points.splice(i, 0, 0);
      }
      state.rowLength += 1;
      return state;
    });

  var addRow$ = click('.addRow')
    .map(() => state => {
      for(var i = 0; i < state.rowLength; i ++) {
        state.points.push(0);
      }
      return state;
    });

  var allOn$ = click('.allOn').map(() => 1);
  var allOff$ = click('.allOff').map(() => 0);
  var toggle$ = allOn$.merge(allOff$)
    .map(value => state => {
      state.points = state.points.map(p => value);
      return state;
    });

  var random$ = click('.random')
    .map(value => state => {
      var i = Math.floor(Math.random() * state.points.length);
      state.points[i] = state.points[i] ? 0 : 1;
      return state;
    });

  var allRandom$ = click('.allRandom')
    .map(value => state => {
      state.points = state.points.map(p => Math.floor(Math.random() * 2));
      return state;
    });

  var clicks$ = Rx.Observable.merge(point$, addColumn$, addRow$, toggle$, random$, allRandom$);

  var hexagonScaleClick$ = sources.DOM.select('.hexagonScale').events('input')
    .map(e => e.target.value);
  var pulsateHexagonScale$ = sources.DOM.select('.pulsateHexagonScale').events('change')
    .map(e => e.target.checked)
    .startWith(false)
    .combineLatest(Rx.Observable.interval(50))
    .map(values => values[0])
    .filter(v => v)
    .map((a,i) => (Math.sin(i / 40) + 1)/2)
  ;
  var hexagonScale$ = Rx.Observable.merge(hexagonScaleClick$, pulsateHexagonScale$)
    .startWith(0.7)
    .map(value => state => {
      state.hexagonScale = value;
      return state;
    });

  var cornerScaleClick$ = sources.DOM.select('.cornerScale').events('input')
    .map(e => e.target.value);
  var pulsateCornerScale$ = sources.DOM.select('.pulsateCornerScale').events('change')
    .map(e => e.target.checked)
    .startWith(false)
    .combineLatest(Rx.Observable.interval(50))
    .map(values => values[0])
    .filter(v => v)
    .map((a,i) => (Math.sin(i / 40) + 1)/2)
  ;
  var cornerScale$ = Rx.Observable.merge(cornerScaleClick$, pulsateCornerScale$)
    .startWith(0.5)
    .map(value => state => {
      state.cornerScale = value;
      return state;
    });
  var variables$ = Rx.Observable.merge(hexagonScale$, cornerScale$);

  var state$ = sources.data
    .map(data => {
      data.hexagonScale = 0.5;
      data.cornerScale = 0.7;
      return data;
    })
    .merge(clicks$)
    .merge(variables$)
    .scan((state, mapper) => mapper(state))
    .map(data => {
      var points = getData(data);
      var pointLines = getPointLines(points.filter(p => p.exists), data.hexagonScale, data.cornerScale);
      var crossLines = getCrossLines(points.filter(p => !p.exists));
      var curves = getCurves(points.filter(p => p.exists), data.hexagonScale, data.cornerScale);
      return {
        hexagonScale: data.hexagonScale,
        cornerScale: data.cornerScale,
        points,
        lines: pointLines
          .concat(crossLines)
          .concat(curves)
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
        h('div', [
          h('button', {className: 'addColumn'}, 'Add column'),
          h('button', {className: 'addRow'}, 'Add row'),
          h('button', {className: 'allOn'}, 'All on'),
          h('button', {className: 'allOff'}, 'All off'),
          h('button', {className: 'allRandom'}, 'All random'),
          h('button', {className: 'random'}, 'Random'),
        ]),
        h('div', [
          'Hexagon scale',
          h('input', {className: 'hexagonScale', value: state.hexagonScale, type: 'range', min: 0, max: 1, step: 0.01}, 'Add row'),
          h('label', [
            'Pulsate',
            h('input', {className: 'pulsateHexagonScale', value: state.pulsateHexagonScale, type: 'checkbox'}),
          ]),
        ]),
        h('div', [
          'Corner scale',
          h('input', {className: 'cornerScale', value: state.cornerScale, type: 'range', min: 0, max: 1, step: 0.01}, 'Add row'),
          h('label', [
            'Pulsate',
            h('input', {className: 'pulsateCornerScale', value: state.pulsateCornerScale, type: 'checkbox'}),
          ]),
        ]),
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
