import React from "react";
export const OfficeViewer = ({ file, onClose }) => {
  // Extract the base64 data without the prefix
  const base64Data = file.content.split(",")[1];

  // Create the Office Online viewer URL
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    `data:${file.fileType};base64,${base64Data}`
  )}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{file.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="flex-1">
          <iframe
            src={officeViewerUrl}
            className="w-full h-full border-0"
            title={`Office Viewer - ${file.name}`}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};
