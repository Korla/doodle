import {addPos, rgbToHex} from './utils';

export default function pointLines(points, hexagonScale, cornerScale){
  if(points.length == 0) return [];
  var maxHor = points[0].colWidth * 4;
  var maxVert = points[0].rowHeight * 4;
  var hex = maxHor * hexagonScale;

  var corner = (pos) => pos.map(l => l * cornerScale);

  var vectors = [
    [0, -hex], [0, -maxVert], [0, -hex],
    corner([-hex, -hex]),
    [-hex, 0], [-maxHor, 0], [-hex, 0],
    corner([-hex, hex]),
    [0, hex], [0, maxVert], [0, hex],
    corner([hex, hex]),
    [hex, 0], [maxHor, 0], [hex, 0],
    corner([hex, -hex]),
  ]

  return points
    .map(p => ({
      positions: vectors.map(v => addPos(p.pos,v)),
      col: rgbToHex(255, p.pos[0]*2.55, p.pos[1]*2.55)
    }));
}
