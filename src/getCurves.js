import {addPos, rgbToHex, getKey} from './utils'

export default function getCurves(points){
  if(points.length == 0) return [];
  var corner = 4;
  var vectors = [[1,1], [1,-1], [-1,-1], [-1,1]];
  var squares = points
    .map(p => {
      return vectors.map(v => ({
        pos: addPos(p.pos,v.map(l => l * corner)),
        key: getKey(p.coords,v)
      }));
    })
    .reduce((prev, current) => prev.concat(current), [])
    .reduce((prev, current) => {
      prev[current.key] = prev[current.key] || [];
      prev[current.key].push(current.pos);
      return prev;
    }, {})
  ;
  return Object.keys(squares).map(key => squares[key])
    .filter(pos => pos.length > 1)
    .map(positions => {
      if(positions.length === 4) {
        var tmp = positions[1];
        positions[1] = positions[0];
        positions[0] = tmp;
      }
      positions.push(positions[0]);
      return {
        positions,
        col: rgbToHex(255, positions[0][0]*2.55, positions[0][1]*2.55)
      }
    })
  ;
}
