import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Button = ({ placeholder, edit, row, col, setBoard, board }) => {
  const [value, setValue] = useState(placeholder !== 0 ? placeholder : '');

  useEffect(() => {
    // If the parent board changes, update the input too
    setValue(placeholder !== 0 ? placeholder : '');
  }, [placeholder]);

const handleChange = (e) => {
  const newValue = e.target.value;

  // Allow empty string (for backspace/delete)
  if (newValue === '') {
    setValue('');
    const updatedBoard = board.map(row => [...row]);
    updatedBoard[row][col] = 0;
    setBoard(updatedBoard);
    return;
  }

  // Check if input is a valid single digit 1-9
  if (/^[1-9]$/.test(newValue)) {
    setValue(newValue);
    const updatedBoard = board.map(row => [...row]);
    updatedBoard[row][col] = parseInt(newValue);
    setBoard(updatedBoard);
  } else {
    toast.error('Please enter numbers 1-9 only!');
  }
};

const handleKeyDown = (e) => {
  // Allow backspace, delete, and arrow keys
  if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.key)) {
    return;
  }
  
  // Allow digits 1-9
  if (/^[1-9]$/.test(e.key)) {
    return;
  }
  
  // Prevent all other keys
  e.preventDefault();
};

return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      maxLength={1}
      readOnly={edit}
      style={{
        width: '32px',
        height: '32px',
        textAlign: 'center',
        fontSize: '18px',
        backgroundColor: edit ? '#f0f0f0' : '#fff',
        border: '1px solid #888',
        color: edit ? '#666' : '#000',
        cursor: edit ? 'not-allowed' : 'text',
      }}
    />
  );
};

export default Button;
