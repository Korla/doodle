import getData from './getData';
import getPointLines from './getPointLines';
import getCrossLines from './getCrossLines';
import getCurves from './getCurves';
import {drawPointsDriver, drawLinesDriver} from './d3Drivers';
import makeDataDriver from './dataDriver';

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
  ;

  var data$ = state$
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

  let container$ = sources.DOM.select('.container').observable.map(elem => elem[0]);

  return {
    DOM: state$.map(state => svg('svg', {class: 'container', attributes: { width: '400', height: '400', viewBox: '0 0 100 100' }})),
    lines: Rx.Observable.combineLatest(
      container$, data$.map(data => data.lines),
      (container, data) => ({container, data})),
    points: Rx.Observable.combineLatest(
      container$, data$.map(data => data.points),
      (container, data) => ({container, data})),
  };
}

const drivers = {
  DOM: makeDOMDriver('body'),
  data: makeDataDriver('r6'),
  lines: drawLinesDriver(),
  points: drawPointsDriver(),
};

Cycle.run(main, drivers);

function log(prefix) {
  return (data) => {
    console.log(prefix, data);
    return data;
  }
}
