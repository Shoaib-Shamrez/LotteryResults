// src/components/TopWinners.jsx
import { memo } from "react";

const TopWinners = ({ winners }) => (
  <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
    <h2 className="text-2xl mb-4">Top 5 Biggest Winners</h2>
    <table className="w-full border-collapse border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2">Name</th>
          <th className="border p-2">Amount</th>
          <th className="border p-2">Date</th>
        </tr>
      </thead>
      <tbody>
        {winners?.map((w, i) => (
          <tr key={i} className="text-center">
            <td className="border p-2">{w.name}</td>
            <td className="border p-2">{w.prize}</td>
            <td className="border p-2">{w.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default memo(TopWinners);
