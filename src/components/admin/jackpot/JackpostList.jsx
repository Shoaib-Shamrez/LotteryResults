import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJackpots, deleteJackpot } from "../../../api/jackpotApi";

const JackpotList = memo(() => {
  const [jackpots, setJackpots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteMessageType, setDeleteMessageType] = useState("");

  // Fetch all jackpots
  useEffect(() => {
    async function fetchJackpots() {
      try {
        const data = await getJackpots();
        setJackpots(data);
      } catch (error) {
        console.error("Error fetching jackpots:", error);
      }
    }
    fetchJackpots();
  }, []);

  // Format draw date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle delete with native confirm
  const handleDelete = async (jackpotId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this jackpot? This action cannot be undone.",
      )
    ) {
      setLoading(true);
      try {
        await deleteJackpot(jackpotId);
        setJackpots((prev) => prev.filter((j) => j.id !== jackpotId));
        setDeleteMessage("✅ Jackpot deleted successfully!");
        setDeleteMessageType("success");
        setTimeout(() => setDeleteMessage(""), 3000);
      } catch (err) {
        console.error("Error deleting jackpot:", err);
        setDeleteMessage(
          "❌ Failed to delete jackpot. Check console for details.",
        );
        setDeleteMessageType("error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Search filter
  const filteredJackpots = jackpots.filter((jackpot) =>
    jackpot.Jackpot_category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jackpots</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all jackpot records
          </p>
        </div>
        <Link
          to="/admin/jackpots/create"
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Create New Jackpot
        </Link>
      </div>

      {/* Delete Message */}
      {deleteMessage && (
        <div
          className={`p-4 rounded-lg border-l-4 ${
            deleteMessageType === "success"
              ? "bg-green-50 border-green-500 text-green-900"
              : "bg-red-50 border-red-500 text-red-900"
          }`}
        >
          <p className="font-medium text-sm">{deleteMessage}</p>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jackpots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Draw Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJackpots?.map((jackpot) => (
                <tr key={jackpot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {jackpot.Jackpot_category}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${jackpot.amount}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(jackpot.draw_date)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-3 py-1 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: jackpot.color }}
                    >
                      {jackpot.color}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/admin/jackpots/edit/${jackpot.id}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(jackpot.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJackpots.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <p>No jackpots found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
});

JackpotList.displayName = "JackpotList";
export default JackpotList;
