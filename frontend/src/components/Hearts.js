import React from 'react';
import '../styles/GameUI.css';

export default function Hearts({ value = 3, max = 3 }) {
  return (
    <div className="hearts" aria-label={`${value} of ${max} hearts left`}>
      {Array.from({ length: max }).map((_, index) => (
        <span key={index} className={`heart ${index < value ? 'full' : 'empty'}`} aria-hidden="true">
          {index < value ? 'H' : '-'}
        </span>
      ))}
    </div>
  );
}
