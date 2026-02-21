import React, { useState } from "react";
import { createLottery } from "../../../api/lotteryApi";

const CreateCategoryForm = ({ onCreate, onClose }) => {
  const [formData, setFormData] = useState({
    NAME: "",
    slug: "",
    description: "",
    History: "",
    draw_days: "",
    draw_time: "",
    How_To_Play: [],
    Winners: [],
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    console.log("the data of form is ", formData);
    try {
      await createLottery(formData);
      setSuccessMsg("Category created successfully!");
      if (onCreate) onCreate();
      if (onClose) setTimeout(onClose, 1000);
      setFormData({
        NAME: "",
        slug: "",
        description: "",
        History: "",
        draw_days: "",
        draw_time: "",
        How_To_Play: [],
        Winners: [],
      });
    } catch (error) {
      setErrorMsg("Error creating category. Please try again.");
      console.error("Error creating category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) onClose();
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
        >
          &times;
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">
            Create Category
          </h2>

          {/* Category Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Category Name:
            </label>
            <input
              type="text"
              name="NAME"
              value={formData.NAME}
              onChange={handleChange}
              required
              placeholder="Enter category name"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Category Slug:
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="Enter slug"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description:
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={2}
              placeholder="Enter description"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* History */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              History And Background:
            </label>
            <textarea
              name="History"
              value={formData.History}
              onChange={handleChange}
              rows={2}
              placeholder="Enter history"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Winners */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Winners:
            </label>
            <div className="overflow-x-auto">
              {formData.Winners.length > 0 ? (
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
                            value={winner.name}
                            onChange={(e) => {
                              const newWinners = [...formData.Winners];
                              newWinners[idx].name = e.target.value;
                              setFormData({ ...formData, Winners: newWinners });
                            }}
                            className="w-full border border-gray-200 rounded px-2 py-1"
                            placeholder="Winner name"
                          />
                        </td>
                        <td className="px-2 py-1 border">
                          <input
                            type="text"
                            value={winner.prize}
                            onChange={(e) => {
                              const newWinners = [...formData.Winners];
                              newWinners[idx].prize = e.target.value;
                              setFormData({ ...formData, Winners: newWinners });
                            }}
                            className="w-full border border-gray-200 rounded px-2 py-1"
                            placeholder="Prize"
                          />
                        </td>
                        <td className="px-2 py-1 border">
                          <input
                            type="text"
                            value={winner.date}
                            onChange={(e) => {
                              const newWinners = [...formData.Winners];
                              newWinners[idx].date = e.target.value;
                              setFormData({ ...formData, Winners: newWinners });
                            }}
                            className="w-full border border-gray-200 rounded px-2 py-1"
                            placeholder="Date"
                          />
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const newWinners = formData.Winners.filter(
                                (_, i) => i !== idx,
                              );
                              setFormData({ ...formData, Winners: newWinners });
                            }}
                            className="text-red-500 hover:text-red-700 px-2"
                          >
                            &times;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    Winners: [
                      ...formData.Winners,
                      { name: "", prize: "", date: "" },
                    ],
                  })
                }
                className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                + Add Winner
              </button>
            </div>
          </div>

          {/* Draw Days */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Draw Days:
            </label>
            <input
              type="text"
              name="draw_days"
              value={formData.draw_days}
              onChange={handleChange}
              placeholder="Enter draw days"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Draw Time */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Draw Time:
            </label>
            <input
              type="text"
              name="draw_time"
              value={formData.draw_time}
              onChange={handleChange}
              placeholder="Enter draw time"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* How To Play */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              How To Play Steps:
            </label>
            {formData.How_To_Play.length > 0 ? (
              <div className="space-y-3">
                {formData?.How_To_Play?.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={step[0]}
                      onChange={(e) => {
                        const newSteps = [...formData.How_To_Play];
                        newSteps[idx][0] = e.target.value;
                        setFormData({ ...formData, How_To_Play: newSteps });
                      }}
                      placeholder={`Step ${idx + 1} description`}
                      className="flex-1 border border-gray-300 rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      value={step[1]}
                      onChange={(e) => {
                        const newSteps = [...formData.How_To_Play];
                        newSteps[idx][1] = e.target.value;
                        setFormData({ ...formData, How_To_Play: newSteps });
                      }}
                      placeholder="Image path"
                      className="w-56 border border-gray-300 rounded px-2 py-1"
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
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      How_To_Play: [...formData.How_To_Play, ["", ""]],
                    })
                  }
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

          {/* Messages */}
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
            {loading ? "Creating..." : "Create Category"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryForm;
