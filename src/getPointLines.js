import {addPos, rgbToHex} from './utils';

export default function pointLines(points, hexagonScale, cornerScale){
  if(points.length == 0) return [];
  var maxHor = points[0].colWidth * 4;
  var maxVert = points[0].rowHeight * 4;
  var hexHor = maxHor * hexagonScale;
  var hexVert = maxVert * hexagonScale;

  var corner = (pos) => pos.map(l => l * cornerScale);

  var vectors = [
    [0, -hexVert], [0, -maxVert], [0, -hexVert],
    corner([-hexHor, -hexVert]),
    [-hexHor, 0], [-maxHor, 0], [-hexHor, 0],
    corner([-hexHor, hexVert]),
    [0, hexVert], [0, maxVert], [0, hexVert],
    corner([hexHor, hexVert]),
    [hexHor, 0], [maxHor, 0], [hexHor, 0],
    corner([hexHor, -hexVert]),
  ]

  return points
    .map(p => ({
      positions: vectors.map(v => addPos(p.pos,v)),
      col: rgbToHex(255, p.pos[0]*2.55, p.pos[1]*2.55)
    }));
}
