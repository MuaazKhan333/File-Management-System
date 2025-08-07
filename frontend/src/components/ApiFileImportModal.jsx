// import React from "react";
// import {
//   FaFilePdf,
//   FaFileWord,
//   FaFileExcel,
//   FaFileAlt,
//   FaFileImage,
//   FaFileVideo,
//   FaDownload,
//   FaExternalLinkAlt,
// } from "react-icons/fa";

// const FileTypeIcon = ({ fileType, url }) => {
//   if (fileType.includes("image")) {
//     return (
//       <img
//         src={url}
//         alt="Preview"
//         className="w-full h-32 object-cover rounded-md"
//       />
//     );
//   }

//   if (fileType.includes("video")) {
//     return (
//       <div className="w-full h-32 flex items-center justify-center bg-gray-100">
//         <FaFileVideo className="text-5xl text-gray-500" />
//       </div>
//     );
//   }

//   if (fileType.includes("pdf"))
//     return (
//       <div className="w-full h-32 flex items-center justify-center bg-red-50">
//         <FaFilePdf className="text-5xl text-red-500" />
//       </div>
//     );

//   if (fileType.includes("word"))
//     return (
//       <div className="w-full h-32 flex items-center justify-center bg-blue-50">
//         <FaFileWord className="text-5xl text-blue-500" />
//       </div>
//     );

//   if (fileType.includes("excel"))
//     return (
//       <div className="w-full h-32 flex items-center justify-center bg-green-50">
//         <FaFileExcel className="text-5xl text-green-500" />
//       </div>
//     );

//   return (
//     <div className="w-full h-32 flex items-center justify-center bg-gray-100">
//       <FaFileAlt className="text-5xl text-gray-500" />
//     </div>
//   );
// };

// const ApiFileImportModal = ({ apiLinks, onImport, onClose }) => {
//   const getFileType = (url) => {
//     const extension = url.split(".").pop().toLowerCase();
//     switch (extension) {
//       case "jpg":
//       case "jpeg":
//       case "png":
//       case "gif":
//         return "image";
//       case "mp4":
//       case "webm":
//       case "mov":
//         return "video";
//       case "pdf":
//         return "pdf";
//       case "doc":
//       case "docx":
//         return "word";
//       case "xls":
//       case "xlsx":
//         return "excel";
//       case "txt":
//       case "csv":
//         return "text";
//       default:
//         return "file";
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
//         <div className="px-6 py-4 border-b">
//           <h3 className="text-xl font-semibold text-gray-800">
//             Import File from API
//           </h3>
//         </div>

//         <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {apiLinks.map((link, index) => {
//             const fileType = getFileType(link);
//             const mimeType =
//               fileType === "image"
//                 ? "image/jpeg"
//                 : fileType === "pdf"
//                 ? "application/pdf"
//                 : fileType === "word"
//                 ? "application/msword"
//                 : fileType === "excel"
//                 ? "application/vnd.ms-excel"
//                 : "text/plain";

//             return (
//               <div
//                 key={index}
//                 className="border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white"
//               >
//                 <FileTypeIcon fileType={mimeType} url={link} />

//                 <div className="px-4 py-3 border-t bg-gray-50">
//                   <p className="text-sm font-medium truncate mb-3 text-gray-700">
//                     {link.split("/").pop()}
//                   </p>
//                   <div className="flex justify-between">
//                     <button
//                       onClick={() => window.open(link, "_blank")}
//                       className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
//                     >
//                       <FaExternalLinkAlt className="mr-2" /> Open
//                     </button>
//                     <button
//                       onClick={() => onImport(link)}
//                       className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-600 rounded hover:bg-green-200"
//                     >
//                       <FaDownload className="mr-2" /> Download
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <div className="p-4 border-t flex justify-end">
//           <button
//             className="px-5 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
//             onClick={onClose}
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ApiFileImportModal;

// import React from "react";
// import {
//   FaFilePdf,
//   FaFileWord,
//   FaFileExcel,
//   FaFileAlt,
//   FaFileImage,
//   FaFileVideo,
//   FaDownload,
//   FaExternalLinkAlt,
// } from "react-icons/fa";
// import { SiGoogledocs } from "react-icons/si"; // For Google Docs icon

// const FileTypeIcon = ({ fileType, url }) => {
//   if (fileType === "image") {
//     return (
//       <img
//         src={url}
//         alt="Preview"
//         className="w-full h-32 object-cover rounded-md"
//       />
//     );
//   }

//   if (fileType === "video") {
//     return (
//       <div className="w-full h-32 flex items-center justify-center bg-gray-100">
//         <FaFileVideo className="text-5xl text-gray-500" />
//       </div>
//     );
//   }

//   if (fileType === "pdf") {
//     return (
//       <div className="w-full h-32 flex items-center justify-center bg-red-50">
//         <FaFilePdf className="text-5xl text-red-500" />
//       </div>
//     );
//   }

//   if (fileType === "doc") {
//     return (
//       <div className="w-full h-32 flex items-center justify-center bg-blue-50">
//         <SiGoogledocs className="text-5xl text-blue-500" />
//       </div>
//     );
//   }

//   if (fileType === "excel") {
//     return (
//       <div className="w-full h-32 flex items-center justify-center bg-green-50">
//         <FaFileExcel className="text-5xl text-green-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-32 flex items-center justify-center bg-gray-100">
//       <FaFileAlt className="text-5xl text-gray-500" />
//     </div>
//   );
// };

// const ApiFileImportModal = ({ apiLinks, onImport, onClose }) => {
//   const getFileType = (url) => {
//     if (url.includes("docs.google.com/document")) return "doc";
//     if (url.includes("docs.google.com/spreadsheets")) return "excel";

//     const extension = url.split(".").pop().toLowerCase().split("?")[0];
//     switch (extension) {
//       case "jpg":
//       case "jpeg":
//       case "png":
//       case "gif":
//         return "image";
//       case "mp4":
//       case "webm":
//       case "mov":
//         return "video";
//       case "pdf":
//         return "pdf";
//       case "doc":
//       case "docx":
//         return "doc";
//       case "xls":
//       case "xlsx":
//       case "csv":
//         return "excel";
//       case "txt":
//         return "text";
//       default:
//         return "file";
//     }
//   };

//   const getDisplayName = (url, fileType) => {
//     let name = decodeURIComponent(url.split("/").pop().split("?")[0]);

//     // Fallback name for Docs or Sheets
//     if (!name || name === "") {
//       if (fileType === "doc") name = "document.doc";
//       else if (fileType === "excel") name = "spreadsheet.xlsx";
//       else name = "file";
//     }

//     // Add extension if missing
//     if (fileType === "doc" && !name.toLowerCase().endsWith(".doc")) {
//       name += ".doc";
//     }

//     if (fileType === "excel" && !name.toLowerCase().endsWith(".xlsx")) {
//       name += ".xlsx";
//     }

//     // Truncate if name is too long
//     if (name.length > 20) {
//       name = name.slice(0, 17) + "...";
//     }

//     return name;
//   };

//   const getGoogleViewerLink = (url, fileType) => {
//     if (fileType === "doc" && url.includes("docs.google.com/document")) {
//       return url.replace("/edit", "/preview");
//     }

//     if (fileType === "excel" && url.includes("docs.google.com/spreadsheets")) {
//       return url.replace("/edit", "/preview");
//     }

//     if (["pdf", "text"].includes(fileType)) {
//       return `https://docs.google.com/gview?url=${encodeURIComponent(
//         url
//       )}&embedded=true`;
//     }

//     return url;
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
//         <div className="px-6 py-4 border-b">
//           <h3 className="text-xl font-semibold text-gray-800">
//             Import File from API
//           </h3>
//         </div>

//         <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {apiLinks.map((link, index) => {
//             const fileType = getFileType(link);
//             const displayName = getDisplayName(link, fileType);

//             return (
//               <div
//                 key={index}
//                 className="border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white"
//               >
//                 <FileTypeIcon fileType={fileType} url={link} />

//                 <div className="px-4 py-3 border-t bg-gray-50">
//                   <p className="text-sm font-medium truncate mb-3 text-gray-700">
//                     {displayName}
//                   </p>
//                   <div className="flex justify-between">
//                     <button
//                       onClick={() =>
//                         window.open(
//                           getGoogleViewerLink(link, fileType),
//                           "_blank"
//                         )
//                       }
//                       className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
//                     >
//                       <FaExternalLinkAlt className="mr-2" /> Open
//                     </button>
//                     <button
//                       onClick={() => onImport(link)}
//                       className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-600 rounded hover:bg-green-200"
//                     >
//                       <FaDownload className="mr-2" /> Download
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <div className="p-4 border-t flex justify-end">
//           <button
//             className="px-5 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
//             onClick={onClose}
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ApiFileImportModal;

import React, { useState } from "react";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileAlt,
  FaFileImage,
  FaFileVideo,
  FaDownload,
  FaExternalLinkAlt,
  FaSpinner,
} from "react-icons/fa";
import { SiGoogledocs } from "react-icons/si"; // For Google Docs icon

const FileTypeIcon = ({ fileType, url }) => {
  const [loading, setLoading] = useState(fileType === "image");
  const [error, setError] = useState(false);

  if (fileType === "image") {
    return (
      <div className="w-full h-32 relative bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
        {loading && !error && (
          <FaSpinner className="animate-spin text-3xl text-gray-400" />
        )}
        {!error && (
          <img
            src={url}
            alt="Preview"
            className={`w-full h-32 object-cover absolute top-0 left-0 transition-opacity duration-300 ${
              loading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
        )}
        {error && <FaFileImage className="text-5xl text-gray-400" />}
      </div>
    );
  }

  if (fileType === "video") {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-gray-100">
        <FaFileVideo className="text-5xl text-gray-500" />
      </div>
    );
  }

  if (fileType === "pdf") {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-red-50">
        <FaFilePdf className="text-5xl text-red-500" />
      </div>
    );
  }

  if (fileType === "doc") {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-blue-50">
        <SiGoogledocs className="text-5xl text-blue-500" />
      </div>
    );
  }

  if (fileType === "excel") {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-green-50">
        <FaFileExcel className="text-5xl text-green-500" />
      </div>
    );
  }

  return (
    <div className="w-full h-32 flex items-center justify-center bg-gray-100">
      <FaFileAlt className="text-5xl text-gray-500" />
    </div>
  );
};

const ApiFileImportModal = ({ apiLinks, onImport, onClose }) => {
  const getFileType = (url) => {
    if (url.includes("docs.google.com/document")) return "doc";
    if (url.includes("docs.google.com/spreadsheets")) return "excel";

    const extension = url.split(".").pop().toLowerCase().split("?")[0];
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "image";
      case "mp4":
      case "webm":
      case "mov":
        return "video";
      case "pdf":
        return "pdf";
      case "doc":
      case "docx":
        return "doc";
      case "xls":
      case "xlsx":
      case "csv":
        return "excel";
      case "txt":
        return "text";
      default:
        return "file";
    }
  };

  const getDisplayName = (url, fileType) => {
    let name = decodeURIComponent(url.split("/").pop().split("?")[0]);

    if (!name || name === "") {
      if (fileType === "doc") name = "document.doc";
      else if (fileType === "excel") name = "spreadsheet.xlsx";
      else name = "file";
    }

    if (fileType === "doc" && !name.toLowerCase().endsWith(".doc")) {
      name += ".doc";
    }

    if (fileType === "excel" && !name.toLowerCase().endsWith(".xlsx")) {
      name += ".xlsx";
    }

    if (name.length > 20) {
      name = name.slice(0, 17) + "...";
    }

    return name;
  };

  const getGoogleViewerLink = (url, fileType) => {
    if (fileType === "doc" && url.includes("docs.google.com/document")) {
      return url.replace("/edit", "/preview");
    }

    if (fileType === "excel" && url.includes("docs.google.com/spreadsheets")) {
      return url.replace("/edit", "/preview");
    }

    if (["pdf", "text"].includes(fileType)) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(
        url
      )}&embedded=true`;
    }

    return url;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">
            Import File from API
          </h3>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {apiLinks.map((link, index) => {
            const fileType = getFileType(link);
            const displayName = getDisplayName(link, fileType);

            return (
              <div
                key={index}
                className="border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white"
              >
                <FileTypeIcon fileType={fileType} url={link} />

                <div className="px-4 py-3 border-t bg-gray-50">
                  <p className="text-sm font-medium truncate mb-3 text-gray-700">
                    {displayName}
                  </p>
                  <div className="flex justify-between">
                    <button
                      onClick={() =>
                        window.open(
                          getGoogleViewerLink(link, fileType),
                          "_blank"
                        )
                      }
                      className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      <FaExternalLinkAlt className="mr-2" /> Open
                    </button>
                    <button
                      onClick={() => onImport(link)}
                      className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-600 rounded hover:bg-green-200"
                    >
                      <FaDownload className="mr-2" /> Download
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            className="px-5 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiFileImportModal;
