// Chess piece artwork as self-contained SVG data URIs.
//
// We use the "solid" Unicode chess glyphs and recolor them so the same shape
// works for both white and black pieces. Because these are plain data URIs,
// they live entirely in the bundle (no network request) and can be preloaded
// into HTMLImageElement objects before the board first renders.

// Solid glyph per piece type (filled silhouettes recolor cleanly).
const GLYPHS = {
  K: '\u265A', // king
  Q: '\u265B', // queen
  R: '\u265C', // rook
  B: '\u265D', // bishop
  N: '\u265E', // knight
  P: '\u265F', // pawn
};

function buildPieceSvg(type, color) {
  const fill = color === 'w' ? '#f8f8f8' : '#202020';
  const stroke = color === 'w' ? '#202020' : '#000000';
  const glyph = GLYPHS[type];

  return [
    "<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'>",
    `<text x='45' y='46' font-size='78' text-anchor='middle' dominant-baseline='central' `,
    `fill='${fill}' stroke='${stroke}' stroke-width='1.5' `,
    "font-family='\"Segoe UI Symbol\", \"Noto Sans Symbols2\", \"DejaVu Sans\", sans-serif'>",
    glyph,
    '</text>',
    '</svg>',
  ].join('');
}

function toDataUri(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Map of piece code -> SVG data URI, e.g. PIECE_IMAGE_SOURCES['wK'].
 */
export const PIECE_IMAGE_SOURCES = (() => {
  const sources = {};
  ['w', 'b'].forEach((color) => {
    Object.keys(GLYPHS).forEach((type) => {
      sources[`${color}${type}`] = toDataUri(buildPieceSvg(type, color));
    });
  });
  return sources;
})();
