import { memo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllcategories,
  getPostById,
  getPrizeBreakDownByPost,
  updatePost,
} from "../../../api/postApi";
import EditablePrizeTable from "./PrizeBreakdownTableEditable";
import SeoFieldsBlock from "./SeoFieldsBlock";
import {
  createPrizeBreakdown,
  deletePrizeBreakdown,
  updatePrizeBreakdown,
} from "../../../api/prizwBreakdownApi";

const EditPost = memo(() => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [middayBreakdown, setMiddayBreakdown] = useState([]);
  const [eveningBreakdown, setEveningBreakdown] = useState([]);
  const [deletedRows, setDeletedRows] = useState([]); // Track deleted rows

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    status: "draft",
    created_at: "",
    Midday_Winnings: "",
    Evening_Winnings: "",
    middayBreakdown: [],
    eveningBreakdown: [],
    content: "",
    meta_title: "",
    meta_desc: "",
  });

  useEffect(() => {
    const fetchBreakdowns = async () => {
      try {
        const data = await getPrizeBreakDownByPost(id);
        console.log("Fetched prize breakdown data:", data);

        const midday = data.prizes.filter((p) => p.draw_type === "midday");
        const evening = data.prizes.filter((p) => p.draw_type === "evening");

        setMiddayBreakdown(midday);
        setEveningBreakdown(evening);
        setFormData((prev) => ({
          ...prev,
          middayBreakdown: midday,
          eveningBreakdown: evening,
        }));
      } catch (err) {
        console.error("Error fetching prize breakdowns:", err);
      }
    };

    fetchBreakdowns();
  }, [id]);

  useEffect(() => {
    async function getcategories() {
      const res = await getAllcategories();
      setCategories(res);
      return res;
    }
    getcategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "Midday_Winnings" || name === "Evening_Winnings") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.split(",").map((v) => v.trim()),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Add row locally (no API call)
  const handleCreateRow = (newRow, session) => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const rowWithTempId = { ...newRow, id: tempId, isNew: true };

    if (session === "midday") {
      setMiddayBreakdown((prev) => [...prev, rowWithTempId]);
      setFormData((prev) => ({
        ...prev,
        middayBreakdown: [...prev.middayBreakdown, rowWithTempId],
      }));
    } else if (session === "evening") {
      setEveningBreakdown((prev) => [...prev, rowWithTempId]);
      setFormData((prev) => ({
        ...prev,
        eveningBreakdown: [...prev.eveningBreakdown, rowWithTempId],
      }));
    }
  };

  // Update row locally (no API call)
  const handleUpdateRow = (index, updatedRow, session) => {
    if (session === "midday") {
      setMiddayBreakdown((prev) =>
        prev.map((r, i) => (i === index ? updatedRow : r))
      );
      setFormData((prev) => ({
        ...prev,
        middayBreakdown: prev.middayBreakdown.map((r, i) =>
          i === index ? updatedRow : r
        ),
      }));
    } else if (session === "evening") {
      setEveningBreakdown((prev) =>
        prev.map((r, i) => (i === index ? updatedRow : r))
      );
      setFormData((prev) => ({
        ...prev,
        eveningBreakdown: prev.eveningBreakdown.map((r, i) =>
          i === index ? updatedRow : r
        ),
      }));
    }
  };

  // Delete row locally (track for later deletion from backend)
  const handleDeleteRow = (index, rowId, session) => {
    const row =
      session === "midday" ? middayBreakdown[index] : eveningBreakdown[index];

    // Only track for deletion if it's an existing row (not a temp ID)
    if (row && !row.isNew && !String(rowId).startsWith("temp_")) {
      setDeletedRows((prev) => [...prev, rowId]);
    }

    if (session === "midday") {
      setMiddayBreakdown((prev) => prev.filter((_, i) => i !== index));
      setFormData((prev) => ({
        ...prev,
        middayBreakdown: prev.middayBreakdown.filter((_, i) => i !== index),
      }));
    } else if (session === "evening") {
      setEveningBreakdown((prev) => prev.filter((_, i) => i !== index));
      setFormData((prev) => ({
        ...prev,
        eveningBreakdown: prev.eveningBreakdown.filter((_, i) => i !== index),
      }));
    }
  };

  useEffect(() => {
    const fetchpostbyId = async () => {
      setLoading(true);
      try {
        const data = await getPostById(id);
        const formattedDate = data.created_at
          ? new Date(data.created_at).toISOString().split("T")[0]
          : "";
        setLoading(false);
        setFormData({
          ...data,
          created_at: formattedDate,
        });
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchpostbyId();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update the main post first

      await updatePost(id, formData);

      // 2. Process deleted rows

      for (const rowId of deletedRows) {
        try {
          await deletePrizeBreakdown(rowId);
          console.log(`✓ Deleted row: ${rowId}`);
        } catch (err) {
          console.error(`✗ Failed to delete row ${rowId}:`, err);
          alert(`Failed to delete row: ${err.message}`);
        }
      }

      // 3. Process midday breakdowns

      for (const row of formData.middayBreakdown) {
        const isNewRow =
          row.isNew === true || String(row.id).startsWith("temp_");

        if (isNewRow) {
          // CREATE new row
          const { id: tempId, isNew, ...rowData } = row;

          // Make sure we have all required fields
          const dataToCreate = {
            category: rowData.category || "",
            winners: rowData.winners || 0,
            draw_type: "midday",
            post_id: id, // The post ID from URL params
            prize_amount: rowData.prize_amount || null,
          };

          try {
            const result = await createPrizeBreakdown(
              dataToCreate,
              "midday",
              id
            );
            console.log("✓ Created midday row:", result);
          } catch (err) {
            console.error("✗ Failed to create midday row:", err);
            alert(`Failed to create midday row: ${err.message}`);
          }
        } else {
          // UPDATE existing row

          try {
            const result = await updatePrizeBreakdown(row);
            console.log("✓ Updated midday row:", result);
          } catch (err) {
            console.error("✗ Failed to update midday row:", err);
            alert(`Failed to update midday row: ${err.message}`);
          }
        }
      }

      // 4. Process evening breakdowns

      for (const row of formData.eveningBreakdown) {
        const isNewRow =
          row.isNew === true || String(row.id).startsWith("temp_");

        if (isNewRow) {
          // CREATE new row
          const { id: tempId, isNew, ...rowData } = row;

          // Make sure we have all required fields
          const dataToCreate = {
            category: rowData.category || "",
            winners: rowData.winners || 0,
            draw_type: "evening",
            post_id: id, // The post ID from URL params
            prize_amount: rowData.prize_amount || null,
          };

          try {
            const result = await createPrizeBreakdown(
              dataToCreate,
              "evening",
              id
            );
            console.log("✓ Created evening row:", result);
          } catch (err) {
            console.error("✗ Failed to create evening row:", err);
            alert(`Failed to create evening row: ${err.message}`);
          }
        } else {
          // UPDATE existing row

          try {
            const result = await updatePrizeBreakdown(row);
            console.log("✓ Updated evening row:", result);
          } catch (err) {
            console.error("✗ Failed to update evening row:", err);
            alert(`Failed to update evening row: ${err.message}`);
          }
        }
      }

      alert("Post updated successfully!");

      // 5. Refresh the data after successful update
      console.log("Step 5: Refreshing data...");
      const data = await getPrizeBreakDownByPost(id);
      const midday = data.prizes.filter((p) => p.draw_type === "midday");
      const evening = data.prizes.filter((p) => p.draw_type === "evening");

      setMiddayBreakdown(midday);
      setEveningBreakdown(evening);
      setFormData((prev) => ({
        ...prev,
        middayBreakdown: midday,
        eveningBreakdown: evening,
      }));
      setDeletedRows([]); // Clear deleted rows

      console.log("✓ Data refreshed");

      // Optional: Navigate after success
      // navigate("/admin/posts");
    } catch (error) {
      console.error("=== ERROR IN SUBMISSION ===", error);
      alert(`Error updating post: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.title) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-gray-600 mt-1">
          Update post information and settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{formData.category}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.slug}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="created_at"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date
              </label>
              <input
                type="date"
                id="created_at"
                name="created_at"
                value={formData.created_at}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="Midday_Winnings"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Midday Winning Numbers
            </label>
            <input
              type="text"
              id="Midday_Winnings"
              name="Midday_Winnings"
              value={formData.Midday_Winnings}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="Evening_Winnings"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Evening Winning Numbers
            </label>
            <input
              type="text"
              id="Evening_Winnings"
              name="Evening_Winnings"
              value={formData.Evening_Winnings}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={formData.content}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Prize Breakdown
            </h2>

            <EditablePrizeTable
              title="Midday"
              data={formData.middayBreakdown || []}
              onCreateRow={(newRow) => handleCreateRow(newRow, "midday")}
              onUpdateRow={(index, updatedRow) =>
                handleUpdateRow(index, updatedRow, "midday")
              }
              onDeleteRow={(index, id) => handleDeleteRow(index, id, "midday")}
            />

            <EditablePrizeTable
              title="Evening"
              data={formData.eveningBreakdown || []}
              onCreateRow={(newRow) => handleCreateRow(newRow, "evening")}
              onUpdateRow={(index, updatedRow) =>
                handleUpdateRow(index, updatedRow, "evening")
              }
              onDeleteRow={(index, id) => handleDeleteRow(index, id, "evening")}
            />
          </div>
        </div>

        <SeoFieldsBlock
          title={{ id: "meta_title", name: "meta_title", value: formData.meta_title }}
          description={{ id: "meta_desc", name: "meta_desc", value: formData.meta_desc }}
          category={formData.category}
          date={formData.created_at}
          middayWinningNumbers={formData.Midday_Winnings}
          eveningWinningNumbers={formData.Evening_Winnings}
          formTitle={formData.title}
          onChangeTitle={handleChange}
          onChangeDescription={handleChange}
        />

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/posts")}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 text-white rounded-lg transition-colors duration-200 ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Updating..." : "Update Post"}
          </button>
        </div>
      </form>
    </div>
  );
});

EditPost.displayName = "EditPost";

export default EditPost;
