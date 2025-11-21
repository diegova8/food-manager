import React from 'react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  color = 'orange-600'
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  return (
    <div
      role="img"
      aria-label={`Rating: ${rating} out of ${maxStars} stars`}
      className="flex items-center justify-center gap-1"
    >
      {[...Array(maxStars)].map((_, index) => (
        <span
          key={index}
          className={`${sizeClasses[size]} ${
            index < rating ? `text-${color}` : 'text-slate-300'
          }`}
        >
          {index < rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};
