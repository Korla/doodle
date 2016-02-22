import {addPos, rgbToHex} from './utils';

export default function getCrossLines(points){
  var length = 4;
  var vert = points[0].rowHeight;
  var hor = points[0].colWidth;
  var vectors =
      [
        [hor,0],[0,0],
        [0,vert],[0,0],
        [-hor,0],[0,0],
        [0,-vert],[0,0]
      ].map(v => v.map(l => l * length));

  return points
    .map(p => {
      return {
        positions: vectors.map(v => addPos(p.pos,v)),
        col: rgbToHex(255, p.pos[0]*2.55, p.pos[1]*2.55)
      };
    });
  ;
}
