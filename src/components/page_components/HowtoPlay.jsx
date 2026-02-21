// src/components/HowToPlay.jsx
import { memo } from "react";

const HowToPlay = ({ steps }) => (
  <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
    <h2 className="text-2xl font-bold mb-4">How to Play</h2>
    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
      {steps?.map((step, idx) => (
        <div
          key={idx}
          className="relative bg-blue-800 overflow-hidden text-white p-6 rounded-xl shadow flex flex-col items-center justify-center text-center"
        >
          {/* Red Badge with Number */}

          <div className="w-20 h-20 rounded-full bg-red-600 absolute -top-6 -left-4  flex items-center justify-center text-white text-2xl ">
            <p className="pl-2 pt-4">{idx + 1}</p>
          </div>

          {/* Icon (replace with actual shop/store icon if you have one) */}
          <div className="mb-4">
            <img
              src={step[1]}
              alt="store"
              width={100}
              height={100}
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Step Text */}
          <p className="text-sm font-medium">{step[0]}</p>
        </div>
      ))}
    </div>
  </div>
);

export default memo(HowToPlay);
