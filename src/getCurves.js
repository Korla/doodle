import {addPos, rgbToHex, getKey} from './utils'

export default function getCurves(points, hexagonScale){
  if(points.length == 0) return [];
  var maxHor = points[0].colWidth * 4;
  var maxVert = points[0].rowHeight* 4;
  var vectors = [[1,1], [1,-1], [-1,-1], [-1,1]]
    .map(v => ({
      key: v,
      deltaPos: [v[0]*maxHor*hexagonScale, v[1]*maxVert*hexagonScale]
    }));

  var squares = points
    .map(p => {
      return vectors.map(v => ({
        pos: addPos(p.pos, v.deltaPos),
        key: getKey(p.coords, v.key)
      }));
    })
    .reduce((prev, current) => prev.concat(current), [])
    .reduce((prev, current) => {
      prev[current.key] = prev[current.key] || [];
      prev[current.key].push(current);
      return prev;
    }, {});
  return Object.keys(squares).map(key => squares[key])
    .filter(pos => pos.length > 1)
    .map(positions => {
      if(positions.length === 4) {
        var tmp = positions[1];
        positions[1] = positions[0];
        positions[0] = tmp;
      }
      positions.push(positions[0]);
      positions = positions.map(p => p.pos)
      return {
        positions,
        col: rgbToHex(255, positions[0][0]*2.55, positions[0][1]*2.55)
      };
    })
  ;
}

function log(prefix) {
  return (data) => {
    console.log(prefix, data);
    return data;
  }
}
