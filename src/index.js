import getData from './getData';
import getPointLines from './getPointLines';
import getCrossLines from './getCrossLines';
import getCurves from './getCurves';
import {drawPointsDriver, drawLinesDriver} from './drivers';
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
  lineDriver: drawLinesDriver(),
  pointDriver: drawPointsDriver(),
};

Cycle.run(main, drivers);
