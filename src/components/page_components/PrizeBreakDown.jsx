// src/components/PrizeBreakdownTable.jsx
import { memo } from "react";

const fmtMoney = (v) => {
  if (v === null || v === undefined || v === "" || v === 0) return "—";
  const n = Number(v);
  if (!Number.isFinite(n) || n === 0) return "—";
  return n >= 1000 ? `$${n.toLocaleString()}` : `$${n}`;
};

const fmtWinners = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  return v;
};

const PrizeBreakdownTable = ({ title, data, totals }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 w-full md:w-1/2">
      <h3 className="text-lg font-semibold mb-3">{title} Prize Breakdown</h3>
      <table className="w-full text-left border-collapse">
        <thead className="">
          <tr className=" border-b bg-blue-950 text-white">
            <th className="py-2 px-3 font-bold">Category</th>
            <th className="py-2 px-3 font-bold">Prize</th>
            <th className="py-2 px-3 font-bold">Winners</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b last:border-none">
              <td className="py-2 px-3">{row.category}</td>
              <td className="py-2 px-3">{fmtMoney(row.prize_amount)}</td>
              <td className="py-2 px-3">{fmtWinners(row.winners)}</td>
            </tr>
          ))}
          <tr className="font-bold bg-gray-100">
            <td className="py-2 px-3">Totals</td>
            <td className="py-2 px-3" />
            <td className="py-2 px-3">{fmtWinners(totals)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default memo(PrizeBreakdownTable);
