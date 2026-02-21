import { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost, getAllcategories } from "../../../api/postApi";
import EditablePrizeTable from "./PrizeBreakdownTableEditable";
import { createPrizeBreakdown } from "../../../api/prizwBreakdownApi";

const CreatePost = memo(() => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [middayBreakdown, setMiddayBreakdown] = useState([]);
  const [eveningBreakdown, setEveningBreakdown] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    status: "draft",
    date: "",
    MiddaywinningNumbers: "",
    EveningwinningNumbers: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    middayBreakdown: [],
    eveningBreakdown: [],
  });

  useEffect(() => {
    async function getcategories() {
      const res = await getAllcategories();
      setCategories(res);
      console.log("Categories Data:", res);
      return res;
    }
    getcategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "MiddaywinningNumbers" || name === "EveningwinningNumbers") {
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
        prev.map((r, i) => (i === index ? updatedRow : r)),
      );
      setFormData((prev) => ({
        ...prev,
        middayBreakdown: prev.middayBreakdown?.map((r, i) =>
          i === index ? updatedRow : r,
        ),
      }));
    } else if (session === "evening") {
      setEveningBreakdown((prev) =>
        prev.map((r, i) => (i === index ? updatedRow : r)),
      );
      setFormData((prev) => ({
        ...prev,
        eveningBreakdown: prev.eveningBreakdown?.map((r, i) =>
          i === index ? updatedRow : r,
        ),
      }));
    }
  };

  // Delete row locally (no API call)
  const handleDeleteRow = (index, rowId, session) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const createdPost = await createPost(formData);
      const newPostId = createdPost.id || createdPost.insertId;

      console.log("✓ Post created with ID:", newPostId);

      if (!newPostId) {
        throw new Error("Failed to get new post ID from response");
      }

      // 2. Create midday prize breakdowns
      console.log("Step 2: Creating midday prize breakdowns...");
      for (const row of formData.middayBreakdown) {
        // Remove temp id and isNew flag
        const { id: tempId, isNew, ...rowData } = row;

        // Prepare data with all required fields
        const dataToCreate = {
          category: rowData.category || "",
          winners: rowData.winners || 0,
          draw_type: "midday",
          post_id: newPostId,
          prize_amount: rowData.prize_amount || null,
        };

        console.log("Creating midday row:", dataToCreate);

        try {
          const result = await createPrizeBreakdown(
            dataToCreate,
            "midday",
            newPostId,
          );
          console.log("✓ Created midday row:", result);
        } catch (err) {
          console.error("✗ Failed to create midday row:", err);
          // Continue with other rows even if one fails
        }
      }

      // 3. Create evening prize breakdowns
      console.log("Step 3: Creating evening prize breakdowns...");
      for (const row of formData.eveningBreakdown) {
        // Remove temp id and isNew flag
        const { id: tempId, isNew, ...rowData } = row;

        // Prepare data with all required fields
        const dataToCreate = {
          category: rowData.category || "",
          winners: rowData.winners || 0,
          draw_type: "evening",
          post_id: newPostId,
          prize_amount: rowData.prize_amount || null,
        };

        console.log("Creating evening row:", dataToCreate);

        try {
          const result = await createPrizeBreakdown(
            dataToCreate,
            "evening",
            newPostId,
          );
          console.log("✓ Created evening row:", result);
        } catch (err) {
          console.error("✗ Failed to create evening row:", err);
          // Continue with other rows even if one fails
        }
      }

      console.log("=== POST CREATION COMPLETED ===");
      alert("Post created successfully!");

      // Optional: Send email notifications
      // sendPostNotification(formData, ["shoaibshamrez@gmail.com"]);

      // Navigate to posts list
      navigate("/admin/posts");
    } catch (error) {
      console.error("=== ERROR IN POST CREATION ===", error);
      alert(`Error creating post: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-gray-600 mt-1">
          Add a new lottery result or article
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
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

            {/* Category */}
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
                <option value="">Select category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.slug}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
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

            {/* Date */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Winning Numbers */}
          <div className="mt-6">
            <label
              htmlFor="MiddaywinningNumbers"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Midday Winning Numbers
            </label>
            <input
              type="text"
              id="MiddaywinningNumbers"
              name="MiddaywinningNumbers"
              value={formData.MiddaywinningNumbers}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 12, 25, 33, 41, 52, Powerball: 8"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="EveningwinningNumbers"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Evening Winning Numbers
            </label>
            <input
              type="text"
              id="EveningwinningNumbers"
              name="EveningwinningNumbers"
              value={formData.EveningwinningNumbers}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 12, 25, 33, 41, 52, Powerball: 8"
            />
          </div>

          {/* Description */}
          <div className="mt-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter post description"
            />
          </div>

          {/* Prize Breakdown Tables */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Prize Breakdown (Optional)
            </h2>

            {/* Midday Prize Breakdown */}
            <EditablePrizeTable
              title="Midday"
              data={formData.middayBreakdown || []}
              onCreateRow={(newRow) => handleCreateRow(newRow, "midday")}
              onUpdateRow={(index, updatedRow) =>
                handleUpdateRow(index, updatedRow, "midday")
              }
              onDeleteRow={(index, id) => handleDeleteRow(index, id, "midday")}
            />

            {/* Evening Prize Breakdown */}
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

        {/* SEO Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            SEO Settings
          </h2>

          <div className="space-y-6">
            {/* Meta Title */}
            <div>
              <label
                htmlFor="metaTitle"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Meta Title
              </label>
              <input
                type="text"
                id="metaTitle"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SEO title for search engines"
              />
            </div>

            {/* Meta Description */}
            <div>
              <label
                htmlFor="metaDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SEO description for search engines"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
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
            {loading ? "Creating..." : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
});

CreatePost.displayName = "CreatePost";

export default CreatePost;
