export function addPos(p1, p2) {
  return p1.map((p,i) => p + p2[i]);
}

export function getKey(pos, vector) {
  return pos.map((p,i) => p + vector[i]).join();
}

export function rgbToHex(r, g, b) {
  return "#" + colToHex(b) + colToHex(g) + colToHex(r);
}

export function colToHex(c) {
    var hex = Math.floor(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
