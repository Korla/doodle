import {addPos, rgbToHex} from './utils';

export default function pointLines(points){
  if(points.length == 0) return [];
  var length = 4;
  var corner = 0.7;
  var vert = points[0].rowHeight;
  var hor = points[0].colWidth;
  var vectors =
      [
        [1,0],[corner,corner],
        [0,1],[0,vert],[0,1],[-corner,corner],
        [-1,0],[-hor,0],[-1,0],[-corner,-corner],
        [0,-1],[0,-vert],[0,-1],[corner, -corner],
        [1,0],[hor, 0]
      ].map(v => v.map(l => l * length));

  return points
    .map(p => ({
      positions: vectors.map(v => addPos(p.pos,v)),
      col: rgbToHex(255, p.pos[0]*2.55, p.pos[1]*2.55)
    }));
}
