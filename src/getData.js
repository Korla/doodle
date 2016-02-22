export default function getData(config){
  var nbrOfColumns = config.rowLength;
  var nbrOfRows = config.points.length / nbrOfColumns;
  var rowHeight = (100 / (nbrOfRows + 1));
  var colWidth = (100 / (nbrOfColumns + 1));
  return config.points
    .map((exists, i) =>
      ({
        coords: [(i % nbrOfColumns + 1), Math.floor(i / nbrOfColumns + 1)],
        rowHeight: rowHeight/8,
        colWidth: colWidth/8,
        exists: exists,
        pos: [
          (i % nbrOfColumns + 1) * colWidth,
          Math.floor(i / nbrOfColumns + 1) * rowHeight
        ]
      })
    );
}
