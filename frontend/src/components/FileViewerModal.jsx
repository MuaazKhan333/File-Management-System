import React, { useState, useEffect } from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

export const FileViewerModal = ({ file, onClose }) => {
  const [error, setError] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    if (file?.content) {
      setFileUrl(file.content);
    } else if (file?.url) {
      setFileUrl(file.url);
    } else {
      setFileUrl("");
    }
  }, [file]);

  const extension = file?.name?.split(".").pop()?.toLowerCase();
  const isDocx = extension === "docx";
  const isPptx = extension === "pptx";
  const isXlsx = extension === "xlsx";
  const isPdf = extension === "pdf";
  const isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(
    extension
  );
  const isTextFile = ["txt", "json", "html", "js", "css"].includes(extension);

  const isBase64 = fileUrl.startsWith("data:");
  const docs = fileUrl ? [{ uri: fileUrl, fileName: file.name }] : [];

  const getViewer = () => {
    // PDF from Base64 → Load directly
    if (isPdf && isBase64) {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-full border-0"
          title="PDF Viewer"
        ></iframe>
      );
    }

    // PDF from URL → Try direct PDF viewer first, fallback to Google Docs
    if (isPdf && !isBase64) {
      return (
        <div className="w-full h-full">
          <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            title="PDF Viewer"
            onError={() => {
              // Fallback to Google Docs if direct PDF fails
              const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
                fileUrl
              )}&embedded=true`;
              window.location.href = googleDocsUrl;
            }}
          />
        </div>
      );
    }

    // DOCX from URL → Use Google Docs Viewer
    if (isDocx && !isBase64) {
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(
            fileUrl
          )}&embedded=true`}
          className="w-full h-full border-0"
          title="Document Viewer"
        ></iframe>
      );
    }

    // DOC from URL → Use Google Docs Viewer
    if (file.name.toLowerCase().endsWith(".doc") && !isBase64) {
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(
            fileUrl
          )}&embedded=true`}
          className="w-full h-full border-0"
          title="Document Viewer"
        ></iframe>
      );
    }

    // PPTX from URL → Google Docs Viewer
    if (isPptx && !isBase64) {
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(
            fileUrl
          )}&embedded=true`}
          className="w-full h-full border-0"
          title="Document Viewer"
        ></iframe>
      );
    }

    // Excel Files via DocViewer
    if (isXlsx) {
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden h-full">
          <DocViewer
            documents={docs}
            pluginRenderers={DocViewerRenderers}
            style={{ height: "100%" }}
            config={{
              header: { disableHeader: true },
              loadingRenderer: {
                overrideComponent: () => (
                  <div className="py-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent inline-block"></div>
                  </div>
                ),
              },
              noRenderer: {
                overrideComponent: () => (
                  <div className="py-20 text-center text-gray-500">
                    No preview available for this file type.
                  </div>
                ),
              },
            }}
            theme={{
              primary: "#3B82F6",
              secondary: "#F3F4F6",
              tertiary: "#E5E7EB",
            }}
            onError={(e) => {
              console.error("DocViewer Error:", e);
              setError("Failed to load Excel file preview.");
            }}
          />
        </div>
      );
    }

    // Image Preview
    if (isImage) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <img
            src={fileUrl}
            alt={file.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      );
    }

    // Text Files Preview
    if (isTextFile) {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-full border-0"
          title="Text Viewer"
        ></iframe>
      );
    }

    // Fallback for Unknown Types using DocViewer
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden h-full">
        <DocViewer
          documents={docs}
          pluginRenderers={DocViewerRenderers}
          style={{ height: "100%" }}
          config={{
            header: { disableHeader: true },
            loadingRenderer: {
              overrideComponent: () => (
                <div className="py-20 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent inline-block"></div>
                </div>
              ),
            },
            noRenderer: {
              overrideComponent: () => (
                <div className="py-20 text-center text-gray-500">
                  No preview available for this file type.
                </div>
              ),
            },
          }}
          theme={{
            primary: "#3B82F6",
            secondary: "#F3F4F6",
            tertiary: "#E5E7EB",
          }}
          onError={(e) => {
            console.error("DocViewer Error:", e);
            setError("Failed to load file preview.");
          }}
        />
      </div>
    );
  };

  const handleDownload = async () => {
    try {
      if (!fileUrl) {
        throw new Error("No file URL available");
      }

      console.log("Starting download for:", file.name);
      console.log("File URL:", fileUrl);

      // Check if this is a CORS-restricted domain
      const urlObj = new URL(fileUrl);
      const corsRestrictedDomains = [
        "github.com",
        "education.github.com",
        "raw.githubusercontent.com",
        "gist.githubusercontent.com",
      ];

      const isCorsRestricted = corsRestrictedDomains.some((domain) =>
        urlObj.hostname.includes(domain)
      );

      let response;

      if (isCorsRestricted) {
        console.log("CORS-restricted domain detected, using proxy");
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(fileUrl)}`;
        response = await fetch(proxyUrl, {
          method: "GET",
          headers: {
            Accept: "*/*",
          },
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });
      } else {
        // For URL-based files, fetch as blob and download
        response = await fetch(fileUrl, {
          method: "GET",
          headers: {
            Accept: "*/*",
          },
          // Add timeout for large files
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch file: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      console.log("Downloaded blob size:", blob.size);
      console.log("Downloaded blob type:", blob.type);

      // Check if blob is valid
      if (blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("Download completed successfully");
    } catch (error) {
      console.error("Download failed:", error);

      // Provide more specific error messages
      if (error.name === "AbortError") {
        alert(
          "Download timed out. The file might be too large or the server is slow."
        );
      } else if (error.message.includes("Failed to fetch")) {
        alert(
          "Download failed. The file URL might be invalid or the server is not responding."
        );
      } else {
        alert(`Download failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 h-screen bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 truncate">
            {file.name}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              Download
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl transform hover:scale-110 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 bg-gray-50 overflow-auto p-4 h-full">
          {error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              {error}
            </div>
          ) : (
            getViewer()
          )}
        </div>
      </div>
    </div>
  );
};
