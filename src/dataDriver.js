import data from './data';
var d = data();
var makeDataDriver =
  (dataSetName) =>
    () =>
      Rx.Observable.just(d[dataSetName])
;

export default makeDataDriver;
