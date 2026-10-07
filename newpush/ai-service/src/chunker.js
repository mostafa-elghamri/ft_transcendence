class textChunker {
  constructor(size, overlap) {
    if (size === undefined || size === null) {
      this.size = 300;
    } else {
      this.size = size;
    }

    if (overlap === undefined || overlap === null) {
      this.overlap = 50;
    } else {
      this.overlap = overlap;
    }
  }

  split(text) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
      let end = start + this.size;

      if (end >= text.length) {
        chunks.push(text.slice(start).trim());
        break;
      }

      let boundary = text.lastIndexOf('\n', end);

      if (boundary === -1 || boundary <= start) {
        boundary = text.lastIndexOf('. ', end);
      }

      if (boundary === -1 || boundary <= start) {
        boundary = end;
      }

      chunks.push(text.slice(start, boundary).trim());
      start = boundary - this.overlap;
    }

    const result = [];

    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i].length > 0) {
        result.push(chunks[i]);
      }
    }

    return result;
  }
}

module.exports = textChunker;