# Sudoku Master - Web Sudoku Solver & Checker

**Live Site:** [https://sudoku-by-heet.onrender.com/](https://sudoku-by-heet.onrender.com/)

## Overview
**Sudoku Master** is a fully functional Sudoku game built using **React.js** that allows users to:
- Fetch Sudoku puzzles from a public API.
- Solve the puzzle manually.
- Automatically check the correctness of the solution.
- Reveal the correct solution using backtracking algorithm.
- Refresh the board or switch difficulty levels instantly.

This project demonstrates frontend engineering skills with API integration, state management, algorithmic problem solving, and user experience design. It also includes real-time feedback using toast notifications.

---

## Features

### ✅ Fetching Sudoku Boards
- Sudoku puzzles are fetched from [Sugoku API](https://github.com/bertoort/sugoku).
- Users can select difficulty: `easy`, `medium`, or `hard`.
- Option to get a new puzzle anytime using the "New Game" button.

### 🎯 Sudoku Solver (Backtracking Algorithm)
- The core Sudoku solving logic is implemented using **recursive backtracking**.
- Logic is encapsulated in a clean, modular JS function (`solveSudoku`) which runs on the frontend.
- When the user chooses "Reveal Solution", the board is filled with the correct answer.

### 🧠 Solution Checker
- Users can fill in their own answers.
- On clicking **Check Solution**, the app compares their answer with the correct one using a solver-generated board.
- Real-time toast feedback:
  - ✅ Correct solution
  - ❌ Incorrect solution
  - ⚠️ Warning if any cell is left blank

### 🧪 Validated Input
- Each input box only accepts values from 1–9.
- Pre-filled (non-zero) cells from the API are non-editable.
- Invalid entries trigger toast notifications.

### 📱 Responsive UI
- Styled with responsive, clean CSS.
- Board is neatly bordered in 3x3 boxes like traditional Sudoku.
- Modern font, colors, gradients, and shadows enhance user experience.

### 🔔 Toast Notifications
- Integrated with `react-hot-toast` for real-time UI messages.
- Used to notify board refreshes, incorrect inputs, solution results.

---

## Tech Stack

| Layer       | Tech                              |
|-------------|-----------------------------------|
| Frontend    | React.js (with Vite)              |
| API         | [Sugoku API](https://github.com/bertoort/sugoku) |
| Styling     | Custom CSS                        |
| Feedback    | react-hot-toast                   |
| Utilities   | react-remove-scroll               |

---

## Folder Structure

