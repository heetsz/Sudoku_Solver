import React from 'react'
import { useEffect, useState, useCallback, useMemo } from 'react';
import Button from './Button';
import { solveSudoku } from './Solver';
import { RemoveScroll } from 'react-remove-scroll';
import toast, { Toaster } from 'react-hot-toast';
import { sudokuService } from './services/sudokuService';
import './App.css';

const App = () => {
  const [board, setBoard] = useState([]);
  const [originalBoard, setOriginalBoard] = useState([]); // Track original puzzle
  const [solved, setSolved] = useState(0);
  const [change, setChange] = useState(0);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  
  // Optimized board fetching with performance monitoring
  const fetchBoard = useCallback(async () => {
    setLoading(true);
    try {
      const result = await sudokuService.fetchBoard(difficulty);
      
      setBoard(result.board);
      setOriginalBoard(result.board.map(row => [...row])); // Store original
      
      // Show performance feedback
      if (result.fromCache) {
        toast.success('Board loaded instantly from cache!');
      } else {
        toast.success(`Board loaded in ${result.loadTime}ms`);
      }
      
      setPerformanceMetrics(sudokuService.getPerformanceMetrics());
      
    } catch (error) {
      console.error('Error fetching board:', error);
      toast.error('Failed to load board. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  // Debounced fetch for rapid difficulty changes
  const debouncedFetchBoard = useCallback(
    sudokuService.fetchBoardDebounced,
    []
  );

  useEffect(() => {
    fetchBoard();
  }, [change, fetchBoard]);

  // Memoized handlers for better performance
  const handleSolve = useCallback(() => {
    // Check if puzzle is completely filled
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) {
          toast.error('Fill all cells first');
          return;
        }
      }
    }

    // Create a copy to test if the current board is valid
    const boardCopy = board.map(row => [...row]);
    const isSolved = solveSudoku(boardCopy);
    
    // Check if current board matches a valid solution
    let isCorrect = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== boardCopy[i][j]) {
          isCorrect = false;
          break;
        }
      }
      if (!isCorrect) break;
    }

    if (isCorrect && isSolved) {
      setSolved(1);
      toast.success('Congratulations! Solution is correct!');
    } else {
      setSolved(2);
      toast.error('Solution has mistakes!');
    }
  }, [board]);

  const handleSolution = useCallback(() => {
    const boardCopy = board.map(row => [...row]); 
    const success = solveSudoku(boardCopy); 
    if (success) {
      setBoard(boardCopy); 
      toast.success('Solution revealed!');
    } else {
      toast.error('No possible solution!');
    }
  }, [board]);

  const handleNew = useCallback(() => {
    setChange(change + 1);
    setSolved(0);
  }, [change]);

  const handleDifficultyChange = useCallback((newDifficulty) => {
    setDifficulty(newDifficulty);
    setSolved(0);
    // Use debounced fetch for rapid changes
    debouncedFetchBoard(newDifficulty, (result) => {
      setBoard(result.board);
      setOriginalBoard(result.board.map(row => [...row]));
      if (result.fromCache) {
        toast.success('Board switched instantly!');
      }
    });
  }, [debouncedFetchBoard]);

  return (
    <RemoveScroll enabled={true}>
      <Toaster position="top-right" />
      <div className="game-container">
        <h1 className="game-title">
          Sudoku Master
          <span className="game-subtitle">
            Challenge Your Mind
          </span>
        </h1>
        
        {/* Performance indicator */}
        {performanceMetrics && (
          <div className="performance-indicator">
            🚀 Optimized: {performanceMetrics.preloadedBoards} boards preloaded
          </div>
        )}
        
        <div className="game-board-container">
          <div className="game-controls">
            <div className="difficulty-selector">
              <label htmlFor="difficulty" className="difficulty-label">
                Difficulty:
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={e => handleDifficultyChange(e.target.value)}
                className="difficulty-select"
                disabled={loading}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <button 
              onClick={handleNew} 
              className="new-game-btn"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'New Game'}
            </button>
          </div>
          
          <div className="sudoku-board-wrapper">
            <table className="sudoku-board">
              <tbody>
                {board.length === 9 &&
                  board.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.length === 9 &&
                        row.map((cell, colIndex) => {
                          const isRightBorder = (colIndex + 1) % 3 === 0 && colIndex < 8;
                          const isBottomBorder = (rowIndex + 1) % 3 === 0 && rowIndex < 8;
                          
                          return (
                            <td 
                              key={colIndex} 
                              className={`sudoku-cell ${isRightBorder ? 'right-border' : ''} ${isBottomBorder ? 'bottom-border' : ''} ${cell !== 0 ? 'filled-cell' : ''}`}
                            >
                              <Button
                                placeholder={cell}
                                edit={originalBoard.length > 0 && originalBoard[rowIndex][colIndex] !== 0}
                                row={rowIndex}
                                col={colIndex}
                                setBoard={setBoard}
                                board={board} 
                              />
                            </td>
                          );
                        })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          
          <div className="action-buttons">
            <button onClick={handleSolve} className="check-solution-btn">
              Check Solution
            </button>
            
            <button onClick={handleSolution} className="reveal-solution-btn">
              Reveal Solution
            </button>
          </div>
        </div>
        
        {solved > 0 && (
          <div className={`result-message ${solved === 1 ? 'success' : 'error'}`}>
            {solved === 1 && <p>✅ Congratulations! Your solution is correct!</p>}
            {solved === 2 && <p>❌ Oops! There are some mistakes in your solution.</p>}
          </div>
        )}
        
        <p className="game-instructions">
          Fill the grid so that every row, column, and 3×3 box contains the digits 1-9
        </p>
      </div>
    </RemoveScroll>
  )
}

export default App