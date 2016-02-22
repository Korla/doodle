export function addPos(p1, p2) {
  return p1.map((p,i) => p + p2[i]);
}

export function getKey(pos, vector) {
  return pos.map((p,i) => p + vector[i]/ 2).join();
}

export function rgbToHex(r, g, b) {
  return "#" + colToHex(r) + colToHex(g) + colToHex(b);
}

export function colToHex(c) {
    var hex = Math.floor(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
