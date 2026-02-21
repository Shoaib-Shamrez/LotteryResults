// src/components/GameCard.jsx
import { memo, useState, useEffect } from "react";
import useCountdown from "../hooks/useCountdown";

/* eslint-disable react/prop-types */
const GameCard = ({
  headerTitle,
  headerLogo,
  headerbgColor,
  date,
  midday,
  evening,
  MidBonusBall,
  EveBonusBall,
  jackpot,
  nextDrawDate,
  payoutLink,
  primaryBtnText,
}) => {
  const timeLeft = useCountdown(nextDrawDate);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Pre-calculate number display to prevent layout shifts
  const renderNumbers = (numbers, bonusBall = null) => (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {numbers?.map((num, i) => (
        <span
          key={i}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-gray-500 text-gray-800 text-sm sm:text-base font-semibold"
        >
          {num}
        </span>
      ))}
      {bonusBall && (
        <span className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-red-600 text-white font-bold">
          {bonusBall}
        </span>
      )}
    </div>
  );

  return (
    <div className="bg-white shadow-md rounded-md overflow-hidden border border-gray-200">
      {/* Header */}
      <div
        className={`${headerbgColor} text-white px-4 py-2 flex justify-between items-center min-h-[60px]`}
      >
        <h2 className="text-lg font-semibold">{headerTitle}</h2>
        <div className="w-[120px] h-[40px] flex items-center justify-center">
          <img
            src={headerLogo}
            alt="logo"
            width="120"
            height="40"
            className={`max-w-[120px] max-h-[40px] transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="w-[120px] h-[40px] bg-gray-300 animate-pulse rounded"></div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex flex-col items-center">
          {/* Date */}
          <p className="text-gray-700 text-sm font-semibold mb-3 min-h-[20px]">
            {date}
          </p>

          {/* Numbers */}
          <div className="flex flex-col justify-center  items-center gap-2 mb-3 w-full">
            <div className="flex gap-2 items-center justify-between ">
              <span className="text-sm font-medium min-w-[70px]">Midday:</span>
              {renderNumbers(midday, MidBonusBall)}
            </div>
            <div className="flex gap-2 items-center justify-between">
              <span className="text-sm font-medium min-w-[70px]">Evening:</span>
              {renderNumbers(evening, EveBonusBall)}
            </div>
          </div>

          {/* Payout link */}
          <a
            href={payoutLink}
            className="block text-sm text-red-600 hover:underline mb-3 min-h-[20px]"
          >
            View Prize Payout for {date} ›
          </a>
        </div>

        {/* Jackpot + Timer */}
        <div className="flex justify-between items-center text-sm font-medium mb-4 min-h-[60px]">
          <div className="min-w-0 flex-1">
            <p className="text-gray-600">Next Estimated Jackpot:</p>
            <p className="text-red-600 text-xl font-bold truncate">{jackpot}</p>
          </div>
          <div className="text-right min-w-[140px]">
            <p className="text-gray-600">Time Until Next Draw:</p>
            <p className="text-red-600 text-lg font-semibold font-mono min-w-[120px] text-right">
              {timeLeft}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between gap-2">
          <button className="bg-blue-800 text-white text-sm font-semibold py-2 px-3 rounded hover:bg-blue-900 transition flex-1 text-center">
            {primaryBtnText}
          </button>
          <button className="bg-yellow-400 text-black text-sm font-bold py-2 px-3 rounded hover:bg-yellow-500 transition flex-1 text-center">
            Buy Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(GameCard);
