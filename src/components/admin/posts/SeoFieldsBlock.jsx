import { memo, useMemo, useState } from "react";
import { previewSeoFields } from "../../../utils/seoMirror";

/**
 * Reusable SEO meta fields block.
 * - metaTitle / metaDescription are optional: if left blank the backend
 *   will auto-generate them (or preserve the existing DB value on update).
 * - A "Preview auto-generated values" toggle shows the live preview that
 *   the backend would produce.
 */
const SeoFieldsBlock = memo(({
  title,
  description,
  category,
  date,
  middayWinningNumbers,
  eveningWinningNumbers,
  formTitle,
  onChangeTitle,
  onChangeDescription
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const preview = useMemo(
    () => previewSeoFields({
      category,
      date,
      middayWinningNumbers,
      eveningWinningNumbers,
      title: formTitle
    }),
    [category, date, middayWinningNumbers, eveningWinningNumbers, formTitle]
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showPreview}
            onChange={(e) => setShowPreview(e.target.checked)}
            className="rounded"
          />
          Preview auto-generated values
        </label>
      </div>

      <div className="space-y-6">
        <div>
          <label
            htmlFor={title.id}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Meta Title
            <span className="ml-2 text-xs text-gray-500">(optional — leave blank to auto-generate)</span>
          </label>
          <input
            type="text"
            id={title.id}
            name={title.name}
            value={title.value}
            onChange={onChangeTitle}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SEO title for search engines"
          />
        </div>

        <div>
          <label
            htmlFor={description.id}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Meta Description
            <span className="ml-2 text-xs text-gray-500">(optional — leave blank to auto-generate)</span>
          </label>
          <textarea
            id={description.id}
            name={description.name}
            value={description.value}
            onChange={onChangeDescription}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SEO description for search engines"
          />
        </div>

        {showPreview && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm space-y-2">
            <div className="font-semibold text-gray-700">Auto-generated preview</div>
            <div>
              <div className="text-xs text-gray-500">Meta Title</div>
              <div className="text-gray-900">{preview.metaTitle}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Meta Description</div>
              <div className="text-gray-900">{preview.metaDescription}</div>
            </div>
            <div className="text-xs text-gray-500 italic">
              The values above are an approximation; the backend will generate
              them when the corresponding field above is blank.
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

SeoFieldsBlock.displayName = "SeoFieldsBlock";
export default SeoFieldsBlock;
