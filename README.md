
---

## Getting Started

### 🛠️ Installation
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/sudoku-master
cd sudoku-master
npm install
npm run dev

## 🧮 Sudoku Solver Logic (Backtracking in C++)
```
#include <iostream>
#include <vector>
#include <cmath>
using namespace std;

bool isValid(vector<vector<int>> &board, int row, int col, int num) {
    // Check row and column
    for (int i = 0; i < 9; i++) {
        if (board[row][i] == num || board[i][col] == num)
            return false;
    }

    // Check 3x3 subgrid
    int startRow = row - row % 3;
    int startCol = col - col % 3;

    for (int i = startRow; i < startRow + 3; i++) {
        for (int j = startCol; j < startCol + 3; j++) {
            if (board[i][j] == num)
                return false;
        }
    }

    return true;
}

bool solveSudoku(vector<vector<int>> &board, int row = 0, int col = 0) {
    // If we reach the end, return true
    if (row == 9)
        return true;

    // Move to next row if column ends
    if (col == 9)
        return solveSudoku(board, row + 1, 0);

    // Skip already filled cells
    if (board[row][col] != 0)
        return solveSudoku(board, row, col + 1);

    // Try numbers 1–9
    for (int num = 1; num <= 9; num++) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num;

            if (solveSudoku(board, row, col + 1))
                return true;

            board[row][col] = 0; // Backtrack
        }
    }

    return false; // No solution found
}

