/* eslint-disable linebreak-style */
import { calcTileType } from '../utils';

const boardSize = 8;

test('test draw', () => {
  expect(calcTileType(0, boardSize)).toBe('top-left');
  expect(calcTileType(boardSize - 1, boardSize)).toBe('top-right');
  expect(calcTileType(boardSize * boardSize - boardSize, boardSize)).toBe('bottom-left');
  expect(calcTileType(boardSize * boardSize - 1, boardSize)).toBe('bottom-right');
  expect(calcTileType(boardSize - 2, boardSize)).toBe('top');
  expect(calcTileType(boardSize * 2, boardSize)).toBe('left');
  expect(calcTileType(boardSize * 2 - 1, boardSize)).toBe('right');
  expect(calcTileType(boardSize * boardSize - 2, boardSize)).toBe('bottom');
  expect(calcTileType(boardSize * 3 - 3, boardSize)).toBe('center');
});
