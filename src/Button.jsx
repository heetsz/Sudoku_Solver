import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const Button = ({ placeholder, edit, row, col, setBoard, board }) => {
  const [value, setValue] = useState(placeholder !== 0 ? placeholder : '');

  useEffect(() => {
    // If the parent board changes, update the input too
    setValue(placeholder !== 0 ? placeholder : '');
  }, [placeholder]);

const handleChange = (e) => {
  const newValue = e.target.value;

  if (/^\d*$/.test(newValue)) {
    if (newValue === '' || (Number(newValue) >= 1 && Number(newValue) <= 9)) {
      setValue(newValue);

      const updatedBoard = board.map(row => [...row]);
      updatedBoard[row][col] = newValue === '' ? 0 : parseInt(newValue);
      setBoard(updatedBoard);
    } else {
      toast.error('Incorrect Number!');
    }
  } else {
    toast.error('Please enter numbers only!');
  }
};

return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      maxLength={1}
      readOnly={edit}
      style={{
        width: '32px',
        height: '32px',
        textAlign: 'center',
        fontSize: '18px',
        backgroundColor: edit ? '#fff' : '#eee',
        border: '1px solid #888',
      }}
    />
  );
};

export default Button;
