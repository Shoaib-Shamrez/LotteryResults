import React, { useState, useEffect } from "react";
import { updateCategory } from "../../../api/categoriesApi";

const EditCategoryForm = ({ categoryId, initialData, onUpdate, onClose }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setFormData(initialData || {});
    console.log("Initial Data:", initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Handle array fields as comma-separated strings
    if (name === "How_To_Play" || name === "Winners") {
      setFormData({
        ...formData,
        [name]: value.split(",").map((v) => v.trim()),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await updateCategory(categoryId, formData);
      setSuccessMsg("Category updated successfully!");
      if (onUpdate) onUpdate();
      if (onClose) setTimeout(onClose, 1000);
    } catch (error) {
      setErrorMsg("Error updating category. Please try again.");
      console.error("Error updating category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm min-h-screen"
      onClick={handleOverlayClick}
    >
      <div
        className="relative max-w-lg w-full bg-white shadow-2xl rounded-lg p-8 border border-gray-200"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">
            Edit Category
          </h2>
          {/* Read-only fields */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-gray-700 font-medium mb-1">
                ID:
              </label>
              <input
                type="text"
                value={formData.id || ""}
                disabled
                className="w-full border border-gray-200 rounded px-3 py-2 bg-gray-100"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700 font-medium mb-1">
                Created At:
              </label>
              <input
                type="text"
                value={formData.created_at || ""}
                disabled
                className="w-full border border-gray-200 rounded px-3 py-2 bg-gray-100"
              />
            </div>
          </div>
          {/* Editable fields */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Category Name:
            </label>
            <input
              type="text"
              name="NAME"
              value={formData.NAME || ""}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter category name"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Category Slug:
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter category slug"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description:
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              required
              rows={2}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter category description"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              History And Background:
            </label>
            <textarea
              name="History"
              value={formData.History || ""}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter history and background"
            />
          </div>

          {/* Editable Winners Table */}
          {Array.isArray(formData.Winners) && (
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Winners:
              </label>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm mb-4">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 border">Name</th>
                      <th className="px-2 py-1 border">Prize</th>
                      <th className="px-2 py-1 border">Date</th>
                      <th className="px-2 py-1 border"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData?.Winners?.map((winner, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-1 border">
                          <input
                            type="text"
                            value={winner.name || ""}
                            onChange={(e) => {
                              const newWinners = [...formData.Winners];
                              newWinners[idx] = {
                                ...newWinners[idx],
                                name: e.target.value,
                              };
                              setFormData({ ...formData, Winners: newWinners });
                            }}
                            className="w-full border border-gray-200 rounded px-2 py-1"
                            placeholder="Winner name"
                          />
                        </td>
                        <td className="px-2 py-1 border">
                          <input
                            type="text"
                            value={winner.prize || ""}
                            onChange={(e) => {
                              const newWinners = [...formData.Winners];
                              newWinners[idx] = {
                                ...newWinners[idx],
                                prize: e.target.value,
                              };
                              setFormData({ ...formData, Winners: newWinners });
                            }}
                            className="w-full border border-gray-200 rounded px-2 py-1"
                            placeholder="Prize"
                          />
                        </td>
                        <td className="px-2 py-1 border">
                          <input
                            type="text"
                            value={winner.date || ""}
                            onChange={(e) => {
                              const newWinners = [...formData.Winners];
                              newWinners[idx] = {
                                ...newWinners[idx],
                                date: e.target.value,
                              };
                              setFormData({ ...formData, Winners: newWinners });
                            }}
                            className="w-full border border-gray-200 rounded px-2 py-1"
                            placeholder="Date"
                          />
                        </td>
                        <td className="px-2 py-1 border text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const newWinners = formData.Winners.filter(
                                (_, i) => i !== idx,
                              );
                              setFormData({ ...formData, Winners: newWinners });
                            }}
                            className="text-red-500 hover:text-red-700 px-2"
                            title="Remove winner"
                          >
                            &times;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      Winners: [
                        ...formData.Winners,
                        { name: "", prize: "", date: "" },
                      ],
                    });
                  }}
                  className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  + Add Winner
                </button>
              </div>
            </div>
          )}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Draw Days:
            </label>
            <input
              type="text"
              name="draw_days"
              value={formData.draw_days || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter draw days"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Draw Time:
            </label>
            <input
              type="text"
              name="draw_time"
              value={formData.draw_time || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter draw time"
            />
          </div>

          {/* How To Play Steps */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              How To Play Steps:
            </label>
            {Array.isArray(formData.How_To_Play) &&
            formData.How_To_Play.length > 0 ? (
              <div className="space-y-3">
                {formData?.How_To_Play?.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={step[0] || ""}
                      onChange={(e) => {
                        const newSteps = [...formData.How_To_Play];
                        newSteps[idx][0] = e.target.value;
                        setFormData({ ...formData, How_To_Play: newSteps });
                      }}
                      className="flex-1 border border-gray-300 rounded px-2 py-1"
                      placeholder={`Step ${idx + 1} description`}
                    />
                    <input
                      type="text"
                      value={step[1] || ""}
                      onChange={(e) => {
                        const newSteps = [...formData.How_To_Play];
                        newSteps[idx][1] = e.target.value;
                        setFormData({ ...formData, How_To_Play: newSteps });
                      }}
                      className="w-56 border border-gray-300 rounded px-2 py-1"
                      placeholder="Image path"
                    />
                    {step[1] && (
                      <img
                        src={step[1]}
                        alt=""
                        className="h-8 w-8 object-contain ml-2"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const newSteps = formData.How_To_Play.filter(
                          (_, i) => i !== idx,
                        );
                        setFormData({ ...formData, How_To_Play: newSteps });
                      }}
                      className="text-red-500 hover:text-red-700 px-2"
                      title="Remove step"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      How_To_Play: [...formData.How_To_Play, ["", ""]],
                    });
                  }}
                  className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  + Add Step
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, How_To_Play: [["", ""]] })
                }
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                + Add Step
              </button>
            )}
          </div>

          {/* Feedback messages */}
          {successMsg && (
            <div className="text-green-600 font-medium">{successMsg}</div>
          )}
          {errorMsg && (
            <div className="text-red-600 font-medium">{errorMsg}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Updating..." : "Update Category"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryForm;
