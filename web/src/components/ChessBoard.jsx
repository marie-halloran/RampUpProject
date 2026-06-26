import { useMemo } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Text } from 'react-konva';
import {
  BOARD_SIZE,
  FILES,
  cloneBoard,
  toSquareName,
} from '../game/chessSetup';
import { usePreloadedPieces } from '../hooks/usePreloadedPieces';

const SQUARE_SIZE = 70;
const BOARD_PX = SQUARE_SIZE * BOARD_SIZE;

const LIGHT = '#eeeed2';
const DARK = '#769656';

function clampIndex(value) {
  return Math.max(0, Math.min(BOARD_SIZE - 1, value));
}

/**
 * Canvas chess board. Pieces are draggable; when a piece is dropped it snaps to
 * the nearest square and the updated board is reported via onMove.
 */
export default function ChessBoard({ board, onMove }) {
  const { images, ready } = usePreloadedPieces();

  // Flatten the matrix into a render list of placed pieces.
  const pieces = useMemo(() => {
    const list = [];
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const code = board[row][col];
        if (code) list.push({ code, row, col });
      }
    }
    return list;
  }, [board]);

  function handleDragEnd(piece, event) {
    const node = event.target;
    const targetCol = clampIndex(Math.round(node.x() / SQUARE_SIZE));
    const targetRow = clampIndex(Math.round(node.y() / SQUARE_SIZE));

    if (targetRow === piece.row && targetCol === piece.col) {
      // Dropped on the same square: snap back to its slot.
      node.position({ x: piece.col * SQUARE_SIZE, y: piece.row * SQUARE_SIZE });
      return;
    }

    const next = cloneBoard(board);
    next[piece.row][piece.col] = null;
    next[targetRow][targetCol] = piece.code; // captures replace the target

    onMove?.(next, {
      piece: piece.code,
      from: toSquareName(piece.row, piece.col),
      to: toSquareName(targetRow, targetCol),
    });
  }

  if (!ready) {
    return <div className="board-loading">Loading board…</div>;
  }

  return (
    <Stage width={BOARD_PX} height={BOARD_PX} className="chess-stage">
      <Layer listening={false}>
        {Array.from({ length: BOARD_SIZE }).map((_, row) =>
          Array.from({ length: BOARD_SIZE }).map((__, col) => (
            <Rect
              key={`sq-${row}-${col}`}
              x={col * SQUARE_SIZE}
              y={row * SQUARE_SIZE}
              width={SQUARE_SIZE}
              height={SQUARE_SIZE}
              fill={(row + col) % 2 === 0 ? LIGHT : DARK}
            />
          ))
        )}

        {/* File labels (a–h) along the bottom rank. */}
        {FILES.map((file, col) => (
          <Text
            key={`file-${file}`}
            x={col * SQUARE_SIZE + 4}
            y={BOARD_PX - 16}
            text={file}
            fontSize={12}
            fill={col % 2 === 0 ? DARK : LIGHT}
          />
        ))}

        {/* Rank labels (1–8) along the left file. */}
        {Array.from({ length: BOARD_SIZE }).map((_, row) => (
          <Text
            key={`rank-${row}`}
            x={4}
            y={row * SQUARE_SIZE + 4}
            text={`${BOARD_SIZE - row}`}
            fontSize={12}
            fill={row % 2 === 0 ? DARK : LIGHT}
          />
        ))}
      </Layer>

      <Layer>
        {pieces.map((piece) => (
          <KonvaImage
            key={`${piece.code}-${piece.row}-${piece.col}`}
            image={images[piece.code]}
            x={piece.col * SQUARE_SIZE}
            y={piece.row * SQUARE_SIZE}
            width={SQUARE_SIZE}
            height={SQUARE_SIZE}
            draggable
            onDragEnd={(event) => handleDragEnd(piece, event)}
          />
        ))}
      </Layer>
    </Stage>
  );
}
