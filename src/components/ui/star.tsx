import { Star } from "lucide-react";
import React, { useState } from "react";

interface StarRatingProps {
  totalStars?: number;
  disable?: boolean;
  onClick?: (rating: number) => void;
  onHover?: (hover: number) => void;
  value?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  totalStars = 5,
  disable = false,
  onClick,
  onHover,
  value = 0,
}) => {
  const [rating, setRating] = useState<number>(value);
  const [hover, setHover] = useState<number>(0);

  const handleClick = (index: number) => {
    if(disable) return
    setRating(index);
    if (onClick) {
      onClick(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (!disable) {
      setHover(index);
      if (onHover) {
        onHover(index);
      }
    }
  };

  const handleMouseLeave = () => {
    if (!disable) {
      setHover(0);
      if (onHover) {
        onHover(0);
      }
    }
  };

  return (
    <div className="flex space-x-1">
      {[...Array(totalStars)].map((_, index) => {
        index += 1;
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                disable ? "hover:cursor-not-allowed" : ""
              } ${
                index <= (hover || rating)
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300 "
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
