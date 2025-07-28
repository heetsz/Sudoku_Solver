import { optimizedApi } from './apiClient.js';
import { requestOptimizer } from './requestOptimizer.js';
import toast from 'react-hot-toast';

class SudokuService {
  constructor() {
    this.initialized = false;
    this.preloadedBoards = new Map(); // Preload boards for instant switching
    this.difficultyLevels = ['easy', 'medium', 'hard'];
    this.init();
  }

  async init() {
    if (this.initialized) return;
    
    // Preload one board for each difficulty for instant access
    const preloadPromises = this.difficultyLevels.map(difficulty => 
      this.preloadBoard(difficulty)
    );
    
    await Promise.allSettled(preloadPromises);
    this.initialized = true;
  }

  // Preload boards in background for instant switching
  async preloadBoard(difficulty) {
    try {
      const board = await this.fetchBoardInternal(difficulty);
      this.preloadedBoards.set(difficulty, board);
    } catch (error) {
      console.warn(`Failed to preload ${difficulty} board:`, error);
    }
  }

  // Internal fetch method with all optimizations
  async fetchBoardInternal(difficulty) {
    const requestKey = `board_${difficulty}`;
    
    return requestOptimizer.deduplicateRequest(requestKey, async () => {
      return requestOptimizer.retryWithBackoff(async () => {
        const response = await optimizedApi.get('/board', {
          params: { difficulty }
        });

        if (!response.data || !response.data.board) {
          throw new Error('Invalid board data received');
        }

        return response.data.board;
      });
    });
  }

  // Optimized board fetching with instant fallback
  async fetchBoard(difficulty = 'medium') {
    try {
      // Check if we have a preloaded board for instant response
      if (this.preloadedBoards.has(difficulty)) {
        const preloadedBoard = this.preloadedBoards.get(difficulty);
        this.preloadedBoards.delete(difficulty);
        
        // Preload a new board for next time in background
        this.preloadBoard(difficulty);
        
        return {
          board: preloadedBoard,
          fromCache: true,
          loadTime: 0
        };
      }

      const startTime = performance.now();
      const board = await this.fetchBoardInternal(difficulty);
      const loadTime = performance.now() - startTime;

      // Preload next board in background
      setTimeout(() => this.preloadBoard(difficulty), 100);

      return {
        board,
        fromCache: false,
        loadTime: Math.round(loadTime)
      };

    } catch (error) {
      console.error('Error fetching board:', error);
      
      // Fallback to any available preloaded board
      const availableBoard = Array.from(this.preloadedBoards.values())[0];
      if (availableBoard) {
        toast.error('Using cached board due to network issue');
        return {
          board: availableBoard,
          fromCache: true,
          loadTime: 0
        };
      }

      throw error;
    }
  }

  // Debounced board fetching for rapid UI changes
  fetchBoardDebounced = requestOptimizer.debounce(
    (difficulty, callback) => {
      this.fetchBoard(difficulty)
        .then(callback)
        .catch(error => {
          console.error('Debounced fetch error:', error);
          toast.error('Failed to load board');
        });
    },
    300
  );

  // Batch multiple requests if needed
  async fetchMultipleBoards(difficulties) {
    const promises = difficulties.map(difficulty => 
      this.fetchBoard(difficulty).catch(error => ({ error, difficulty }))
    );
    
    return Promise.allSettled(promises);
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return {
      cacheHitRate: this.preloadedBoards.size > 0 ? 1 : 0,
      preloadedBoards: this.preloadedBoards.size,
      supportedDifficulties: this.difficultyLevels.length
    };
  }

  // Clear caches and reset
  reset() {
    this.preloadedBoards.clear();
    this.initialized = false;
  }
}

export const sudokuService = new SudokuService();
