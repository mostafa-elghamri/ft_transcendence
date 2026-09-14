class TextChunker {
  constructor(chunkSize, overlap) {
    if (chunkSize === undefined || chunkSize === null) {
      this.chunkSize = 300;
    } else {
      this.chunkSize = chunkSize;
    }

    if (overlap === undefined || overlap === null) {
      this.overlap = 50;
    } else {
      this.overlap = overlap;
    }
  }

  split(text) {
    var chunks = [];
    var start = 0;

    while (start < text.length) {
      var end = start + this.chunkSize;

      if (end >= text.length) {
        var lastPiece = text.slice(start).trim();
        chunks.push(lastPiece);
        break;
      }

      var boundary = text.lastIndexOf('\n', end);

      if (boundary === -1 || boundary <= start) {
        boundary = text.lastIndexOf('. ', end);
      }

      if (boundary === -1 || boundary <= start) {
        boundary = end;
      }

      var piece = text.slice(start, boundary).trim();
      chunks.push(piece);
      start = boundary - this.overlap;
    }

    var result = [];
    for (var i = 0; i < chunks.length; i++) {
      if (chunks[i].length > 0) {
        result.push(chunks[i]);
      }
    }

    return result;
  }
}

module.exports = TextChunker;
