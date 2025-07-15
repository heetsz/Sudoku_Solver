function isValid(board, row, col, num) {
  const n = 9;
  for (let x = 0; x < n; x++) {
    if (board[x][col] === num || board[row][x] === num) return false;
  }

  const rn = 3; // sqrt(9)
  const startRow = row - (row % rn);
  const startCol = col - (col % rn);

  for (let i = startRow; i < startRow + rn; i++) {
    for (let j = startCol; j < startCol + rn; j++) {
      if (board[i][j] === num) return false;
    }
  }

  return true;
}

export function solveSudoku(board, i = 0, j = 0) {
  if (i === 9) return true;

  if (j === 9) return solveSudoku(board, i + 1, 0);

  if (board[i][j] !== 0) return solveSudoku(board, i, j + 1);

  for (let num = 1; num <= 9; num++) {
    if (isValid(board, i, j, num)) {
      board[i][j] = num;
      if (solveSudoku(board, i, j + 1)) return true;
      board[i][j] = 0;
    }
  }

  return false;
}
