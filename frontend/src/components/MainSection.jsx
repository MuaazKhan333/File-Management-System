// import React, { useContext, useEffect, useRef, useState } from "react";
// import {
//   FiFileText,
//   FiImage,
//   FiFolder,
//   FiFile,
//   FiVideo,
//   FiArrowLeft,
//   FiMoreVertical,
//   FiCheckSquare,
//   FiSquare,
//   FiTrash2,
// } from "react-icons/fi";
// import { FileContext } from "../context/FileContext";
// import { getUserDeletedFiles } from "./utils/db";
// import { FaFileExcel, FaFilePdf } from "react-icons/fa"; // Adjust path if needed
// import axios from "axios";
// import { useAuth0 } from "@auth0/auth0-react";
// import { getFileById, saveFile } from "./utils/db.js";

// const formatBytes = (bytes, decimals = 2) => {
//   if (!+bytes) return "0 Bytes";
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
// };

// const getFileTypeIcon = (fileName) => {
//   if (!fileName) return <FiFile className="text-gray-500 w-5 h-5" />;
//   const extension = fileName.toLowerCase().split(".").pop();
//   switch (extension) {
//     case "png":
//     case "jpg":
//     case "jpeg":
//     case "gif":
//       return <FiImage className="text-purple-500 w-5 h-5" />;
//     case "mp4":
//     case "webm":
//       return <FiVideo className="text-pink-500 w-5 h-5" />;
//     case "pdf":
//       return <FaFilePdf className="text-red-500 mr-2 w-4 h-4" />;
//     case "js":
//     case "json":
//     case "txt":
//     case "html":
//     case "css":
//       return <FiFileText className="text-green-500 w-5 h-5" />;
//     case "excel":
//     case "spreadsheetml":
//     case "xlsx":
//       return <FaFileExcel className="text-green-600 mr-2 w-4 h-4" />;
//     case "docx":
//       return <FiFileText className="text-blue-600 mr-2 w-4 h-4" />;
//     default:
//       return <FiFile className="text-gray-500 w-5 h-5" />;
//   }
// };

// // 📦 ITEMS PER PAGE SETTINGS
// const ITEMS_PER_PAGE = {
//   list: 5,
//   grid: 15,
// };

// const MainSection = () => {
//   const {
//     files,
//     currentFolder,
//     setCurrentFolder,
//     getFullFolder,
//     openFile,
//     searchQuery,
//     renameItem,
//     deleteItem,
//     getItemSize,
//     viewMode, // Added user from context
//   } = useContext(FileContext);

//   const [menuOpenId, setMenuOpenId] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [isSelectAll, setIsSelectAll] = useState(false);
//   const [uploadFile, setUploadFile] = useState(null);
//   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);

//   const { user, getAccessTokenSilently } = useAuth0();

//   const menuRef = useRef();

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setMenuOpenId(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const areAllItemsSelected = () => {
//     const allContents = getCurrentContents();
//     return (
//       allContents.length > 0 &&
//       selectedItems.length === allContents.length &&
//       allContents.every((item) => selectedItems.includes(item.id))
//     );
//   };

//   const handleBack = () => {
//     if (!currentFolder) return;

//     const folderObj =
//       typeof currentFolder === "string"
//         ? getFullFolder(currentFolder)
//         : currentFolder;

//     if (!folderObj?.parentId) {
//       setCurrentFolder(null);
//       return;
//     }

//     const parent = getFullFolder(folderObj.parentId);
//     if (parent) {
//       setCurrentFolder(parent);
//     }
//   };

//   const getCurrentContents = () => {
//     let contents = [];

//     if (!currentFolder) {
//       contents = files.filter((f) => !f.parentId);
//     } else {
//       contents = files.filter((f) => f.parentId === currentFolder.id);
//     }

//     if (searchQuery) {
//       contents = contents.filter((item) =>
//         item.name.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     return contents;
//   };

//   const handleRename = (item) => {
//     const lastDotIndex = item.name.lastIndexOf(".");
//     const hasExtension = item.type === "file" && lastDotIndex !== -1;

//     const baseName = hasExtension
//       ? item.name.substring(0, lastDotIndex)
//       : item.name;
//     const extension = hasExtension ? item.name.substring(lastDotIndex) : "";

//     const newBaseName = prompt("Enter new name:", baseName);
//     if (newBaseName && newBaseName.trim() !== "") {
//       const newFullName = newBaseName.trim() + extension;
//       renameItem(item.id, newFullName);
//     }
//   };

//   const handleDelete = async (item) => {
//     if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
//       try {
//         await deleteItem(item);
//       } catch (error) {
//         console.error("Error deleting item:", error);
//         alert("Failed to delete item. Please try again.");
//       }
//     }
//   };

//   const handleDeleteSelected = async () => {
//     if (selectedItems.length === 0) return;

//     if (
//       window.confirm(
//         `Are you sure you want to delete ${selectedItems.length} selected items?`
//       )
//     ) {
//       try {
//         // Get all selected items
//         const itemsToDelete = allContents.filter((item) =>
//           selectedItems.includes(item.id)
//         );

//         // Delete each item
//         for (const item of itemsToDelete) {
//           await deleteItem(item);
//         }

//         setSelectedItems([]);
//         setIsSelectAll(false);
//       } catch (error) {
//         console.error("Error deleting selected items:", error);
//         alert("Failed to delete some items. Please try again.");
//       }
//     }
//   };

//   const toggleItemSelection = (id) => {
//     setSelectedItems((prev) =>
//       prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
//     );
//   };

//   const toggleSelectAll = () => {
//     const allContents = getCurrentContents();
//     if (areAllItemsSelected()) {
//       setSelectedItems([]);
//     } else {
//       setSelectedItems(allContents.map((item) => item.id));
//     }
//     setIsSelectAll(!areAllItemsSelected());
//   };

//   const allContents = getCurrentContents();
//   const perPage =
//     viewMode === "grid" ? ITEMS_PER_PAGE.grid : ITEMS_PER_PAGE.list;
//   const totalPages = Math.ceil(allContents.length / perPage);
//   const paginatedContents = allContents.slice(
//     (currentPage - 1) * perPage,
//     currentPage * perPage
//   );

//   // Count files and folders for each item
//   const getItemCounts = (item) => {
//     if (item.type === "file") {
//       return {
//         files: 1,
//         folders: 0,
//       };
//     }

//     // For folders, count their contents
//     const folderContents = files.filter((f) => f.parentId === item.id);
//     return {
//       files: folderContents.filter((f) => f.type === "file").length,
//       folders: folderContents.filter((f) => f.type === "folder").length,
//     };
//   };

//   // Total counts for display
//   const totalFiles = allContents.filter((item) => item.type === "file").length;
//   const totalFolders = allContents.filter(
//     (item) => item.type === "folder"
//   ).length;
//   const selectedFiles = selectedItems.filter((id) => {
//     const item = allContents.find((item) => item.id === id);
//     return item?.type === "file";
//   }).length;
//   const selectedFolders = selectedItems.filter((id) => {
//     const item = allContents.find((item) => item.id === id);
//     return item?.type === "folder";
//   }).length;

//   useEffect(() => {
//     if (currentPage > totalPages) {
//       setCurrentPage(1);
//     }
//   }, [allContents, totalPages]);

//   const handleFileUpload = async (item) => {
//     try {
//       setIsUploading(true);

//       if (!user?.email) {
//         throw new Error("User not authenticated");
//       }

//       // Get the complete file data from IndexedDB
//       const fileData = await getFileById(user.email, item.id);

//       if (!fileData) {
//         throw new Error("File not found in database");
//       }

//       // Check if file is already uploaded to Google Drive
//       // if (fileData.googleDriveUrl || fileData.uploadedToGoogleDrive) {
//       //   alert("File is already uploaded to Google Drive!");
//       //   return;
//       // }

//       // Prepare the file content for upload - handle both content and URL cases
//       let fileContent;
//       let fileName = fileData.name;
//       let mimeType = fileData.fileType;

//       if (fileData.content && fileData.content.startsWith("data:")) {
//         // Handle base64 data URL
//         const base64Data = fileData.content.split(",")[1];
//         const byteString = atob(base64Data);
//         mimeType = fileData.content.match(/^data:(.*?);/)[1];
//         const ab = new ArrayBuffer(byteString.length);
//         const ia = new Uint8Array(ab);
//         for (let i = 0; i < byteString.length; i++) {
//           ia[i] = byteString.charCodeAt(i);
//         }
//         fileContent = new Blob([ab], { type: mimeType });
//       } else if (fileData.url) {
//         // Handle files stored as URLs (like Google Sheets)

//         // Check if this is a CORS-restricted domain
//         const urlObj = new URL(fileData.url);
//         const corsRestrictedDomains = [
//           "github.com",
//           "education.github.com",
//           "raw.githubusercontent.com",
//           "gist.githubusercontent.com",
//         ];

//         const isCorsRestricted = corsRestrictedDomains.some((domain) =>
//           urlObj.hostname.includes(domain)
//         );

//         let response;

//         if (isCorsRestricted) {
//           console.log(
//             "CORS-restricted domain detected, using proxy for upload"
//           );
//           const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(
//             fileData.url
//           )}`;
//           response = await fetch(proxyUrl);
//         } else {
//           // Try direct fetch first
//           try {
//             response = await fetch(fileData.url);
//           } catch (directError) {
//             console.log(
//               "Direct fetch failed, trying CORS proxy:",
//               directError.message
//             );
//             const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(
//               fileData.url
//             )}`;
//             response = await fetch(proxyUrl);
//           }
//         }

//         if (!response.ok) {
//           throw new Error(
//             `Failed to fetch file from URL: ${response.status} ${response.statusText}`
//           );
//         }

//         fileContent = await response.blob();
//         // If mimeType isn't set, get it from the response
//         if (!mimeType) {
//           mimeType = response.headers.get("content-type");
//         }
//       } else {
//         // Handle other binary data or Blob
//         fileContent =
//           fileData.content instanceof Blob
//             ? fileData.content
//             : new Blob([fileData.content || ""], {
//                 type: mimeType || "application/octet-stream",
//               });
//       }

//       // Create FormData for the upload
//       const formData = new FormData();
//       formData.append("file", fileContent, fileName);
//       formData.append("name", fileName);
//       formData.append("mimeType", mimeType || "application/octet-stream");
//       formData.append("parentId", fileData.parentId || "");
//       formData.append("userEmail", user.email);

//       const token = await getAccessTokenSilently();
//       const response = await axios.post(
//         "http://localhost:8000/upload-file-to-google-drive",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("✅ Google Drive upload successful:", response.data);

//       // Update the file in IndexedDB with the Google Drive URL
//       if (response.data.publicUrl) {
//         const updatedFileData = {
//           ...fileData,
//           url: response.data.publicUrl,
//           content: null, // Remove base64 content since we now have a URL
//           uploadedToGoogleDrive: true,
//           googleDriveUrl: response.data.publicUrl,
//           size: fileContent.size, // Preserve the file size
//         };

//         await saveFile(user.email, updatedFileData);
//         console.log("✅ File updated in database with Google Drive URL");
//       }

//       alert("File uploaded to Google Drive successfully");
//     } catch (error) {
//       console.error("❌ Google Drive upload failed:", error);
//       alert(`Upload failed: ${error.message}`);
//     } finally {
//       setIsUploading(false);
//       setMenuOpenId(null);
//     }
//   };

//   // const handleFileUpload = async (item) => {
//   //   try {
//   //     setIsUploading(true);

//   //     if (!user?.email) {
//   //       throw new Error("User not authenticated");
//   //     }

//   //     // Get the complete file data from IndexedDB
//   //     const fileData = await getFileById(user.email, item.id);

//   //     if (!fileData) {
//   //       throw new Error("File not found in database");
//   //     }

//   //     // Prepare the file content for upload - handle both content and URL cases
//   //     let fileContent;
//   //     let fileName = fileData.name;
//   //     let mimeType = fileData.fileType;

//   //     if (fileData.content && fileData.content.startsWith("data:")) {
//   //       // Handle base64 data URL
//   //       const base64Data = fileData.content.split(",")[1];
//   //       const byteString = atob(base64Data);
//   //       mimeType = fileData.content.match(/^data:(.*?);/)[1];
//   //       const ab = new ArrayBuffer(byteString.length);
//   //       const ia = new Uint8Array(ab);
//   //       for (let i = 0; i < byteString.length; i++) {
//   //         ia[i] = byteString.charCodeAt(i);
//   //       }
//   //       fileContent = new Blob([ab], { type: mimeType });
//   //     } else if (fileData.url) {
//   //       // Handle files stored as URLs (like Google Sheets)
//   //       const urlObj = new URL(fileData.url);
//   //       const corsRestrictedDomains = [
//   //         "github.com",
//   //         "education.github.com",
//   //         "raw.githubusercontent.com",
//   //         "gist.githubusercontent.com",
//   //       ];

//   //       const isCorsRestricted = corsRestrictedDomains.some((domain) =>
//   //         urlObj.hostname.includes(domain)
//   //       );

//   //       let response;

//   //       if (isCorsRestricted) {
//   //         console.log(
//   //           "CORS-restricted domain detected, using proxy for upload"
//   //         );
//   //         const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(
//   //           fileData.url
//   //         )}`;
//   //         response = await fetch(proxyUrl);
//   //       } else {
//   //         // Try direct fetch first
//   //         try {
//   //           response = await fetch(fileData.url);
//   //         } catch (directError) {
//   //           console.log(
//   //             "Direct fetch failed, trying CORS proxy:",
//   //             directError.message
//   //           );
//   //           const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(
//   //             fileData.url
//   //           )}`;
//   //           response = await fetch(proxyUrl);
//   //         }
//   //       }

//   //       if (!response.ok) {
//   //         throw new Error(
//   //           `Failed to fetch file from URL: ${response.status} ${response.statusText}`
//   //         );
//   //       }

//   //       fileContent = await response.blob();
//   //       // If mimeType isn't set, get it from the response
//   //       if (!mimeType) {
//   //         mimeType = response.headers.get("content-type");
//   //       }
//   //     } else {
//   //       // Handle other binary data or Blob
//   //       fileContent =
//   //         fileData.content instanceof Blob
//   //           ? fileData.content
//   //           : new Blob([fileData.content || ""], {
//   //               type: mimeType || "application/octet-stream",
//   //             });
//   //     }

//   //     // Create FormData for the upload
//   //     const formData = new FormData();
//   //     formData.append("file", fileContent, fileName);
//   //     formData.append("name", fileName);
//   //     formData.append("mimeType", mimeType || "application/octet-stream");
//   //     formData.append("parentId", fileData.parentId || "");
//   //     formData.append("userEmail", user.email);

//   //     const token = await getAccessTokenSilently();
//   //     const response = await axios.post(
//   //       "http://localhost:8000/upload-file-to-google-drive",
//   //       formData,
//   //       {
//   //         headers: {
//   //           "Content-Type": "multipart/form-data",
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       }
//   //     );

//   //     console.log("✅ Google Drive upload successful:", response.data);

//   //     // Update the file in IndexedDB with the new Google Drive URL
//   //     // This will add a new URL each time the file is uploaded
//   //     if (response.data.publicUrl) {
//   //       const updatedFileData = {
//   //         ...fileData,
//   //         url: response.data.publicUrl,
//   //         content: null, // Remove base64 content since we now have a URL
//   //         uploadedToGoogleDrive: true,
//   //         googleDriveUrl: response.data.publicUrl,
//   //         size: fileContent.size, // Preserve the file size
//   //       };

//   //       await saveFile(user.email, updatedFileData);
//   //       console.log("✅ File updated in database with new Google Drive URL");
//   //     }

//   //     alert("File uploaded to Google Drive successfully");
//   //   } catch (error) {
//   //     console.error("❌ Google Drive upload failed:", error);
//   //     alert(`Upload failed: ${error.message}`);
//   //   } finally {
//   //     setIsUploading(false);
//   //     setMenuOpenId(null);
//   //   }
//   // };
//   return (
//     <div className="flex-1 p-6">
//       {/* Top Bar with Selection Controls */}
//       <div className="flex justify-between items-center mb-4">
//         <div className="flex items-center space-x-4">
//           <button
//             onClick={toggleSelectAll}
//             className={`flex items-center gap-2 px-4 py-2 rounded-md ${
//               areAllItemsSelected()
//                 ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
//                 : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//             } transition-colors`}
//           >
//             {areAllItemsSelected() ? (
//               <FiCheckSquare className="w-5 h-5" />
//             ) : (
//               <FiSquare className="w-5 h-5" />
//             )}
//             <span>{areAllItemsSelected() ? "Unselect All" : "Select All"}</span>
//           </button>

//           {selectedItems.length > 0 && (
//             <button
//               onClick={handleDeleteSelected}
//               className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
//             >
//               <FiTrash2 className="w-5 h-5" />
//               <span>Delete Selected</span>
//             </button>
//           )}
//         </div>

//         <h2 className="text-xl font-semibold">
//           {currentFolder
//             ? typeof currentFolder === "string"
//               ? getFullFolder(currentFolder)?.name
//               : currentFolder.name
//             : "Files Management System"}
//         </h2>

//         {currentFolder && (
//           <button
//             onClick={handleBack}
//             className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
//           >
//             <FiArrowLeft className="w-4 h-4" />
//             Back
//           </button>
//         )}
//       </div>

//       {/* File/Folder Count */}
//       <div className="mb-4 text-sm text-gray-500">
//         Showing {allContents.length} items ({totalFiles} files, {totalFolders}{" "}
//         folders)
//         {selectedItems.length > 0 && (
//           <span className="ml-4">
//             Selected: {selectedItems.length} ({selectedFiles} files,{" "}
//             {selectedFolders} folders)
//           </span>
//         )}
//       </div>

//       {viewMode === "list" ? (
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className=" py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   {/* <input
//                     type="checkbox"
//                     checked={
//                       isSelectAll && selectedItems.length === allContents.length
//                     }
//                     onChange={toggleSelectAll}
//                     className="h-4 w-4 text-blue-600 rounded"
//                   /> */}
//                 </th>
//                 <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Size
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Date
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Files
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Folders
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {paginatedContents.map((item) => {
//                 const counts = getItemCounts(item);
//                 return (
//                   <tr
//                     key={item.id}
//                     className={
//                       selectedItems.includes(item.id) ? "bg-blue-50" : ""
//                     }
//                   >
//                     <td className="px-2 py-4 whitespace-nowrap">
//                       <input
//                         type="checkbox"
//                         checked={selectedItems.includes(item.id)}
//                         onChange={() => toggleItemSelection(item.id)}
//                         onClick={(e) => e.stopPropagation()}
//                         className="h-4 w-4 text-blue-600 rounded"
//                       />
//                     </td>
//                     <td
//                       className="px-0 py-4 whitespace-nowrap flex items-center cursor-pointer"
//                       onClick={() => {
//                         if (item.type === "folder") {
//                           setCurrentFolder(item);
//                         } else {
//                           openFile(item);
//                         }
//                       }}
//                     >
//                       {item.type === "folder" ? (
//                         <FiFolder className="w-5 h-5 mr-2 text-blue-500" />
//                       ) : (
//                         <span className="mr-2">
//                           {getFileTypeIcon(item.name)}
//                         </span>
//                       )}
//                       <span className="text-sm text-gray-800">{item.name}</span>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500">
//                       {formatBytes(getItemSize(item))}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500">
//                       {new Date(item.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500">
//                       {counts.files}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500">
//                       {counts.folders}
//                     </td>
//                     <td className="relative px-6 py-4 text-right">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setMenuOpenId(item.id);
//                         }}
//                       >
//                         <FiMoreVertical className="w-4 h-4 text-gray-500" />
//                       </button>
//                       {menuOpenId === item.id && (
//                         <div
//                           ref={menuRef}
//                           className="absolute right-6 mt-[-70px] w-28 bg-white border border-gray-200 rounded shadow-md z-50"
//                         >
//                           <button
//                             className="block w-full text-left px-2 py-2 text-sm hover:bg-gray-100"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleFileUpload(item);
//                             }}
//                           >
//                             Upload File
//                           </button>
//                           <button
//                             className="block w-full text-left px-2 py-2 text-sm hover:bg-gray-100"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setMenuOpenId(null);
//                               handleRename(item);
//                             }}
//                           >
//                             Rename
//                           </button>
//                           <button
//                             className="block w-full text-left px-2 py-2 text-sm hover:bg-gray-100 text-red-600"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setMenuOpenId(null);
//                               handleDelete(item);
//                             }}
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//               {paginatedContents.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan="7"
//                     className="px-6 py-4 text-gray-400 italic text-center"
//                   >
//                     {searchQuery
//                       ? "No matching results"
//                       : "No files or folders here"}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//           {paginatedContents.map((item) => {
//             const counts = getItemCounts(item);
//             return (
//               <div
//                 key={item.id}
//                 className={`border p-4 rounded shadow bg-white cursor-pointer hover:shadow-md transition relative ${
//                   selectedItems.includes(item.id) ? "ring-2 ring-blue-500" : ""
//                 }`}
//                 onClick={(e) => {
//                   // Don't navigate if clicking on checkbox
//                   if (e.target.type !== "checkbox") {
//                     if (item.type === "folder") {
//                       setCurrentFolder(item);
//                     } else {
//                       openFile(item);
//                     }
//                   }
//                 }}
//               >
//                 <input
//                   type="checkbox"
//                   checked={selectedItems.includes(item.id)}
//                   onChange={() => toggleItemSelection(item.id)}
//                   onClick={(e) => e.stopPropagation()}
//                   className="absolute top-1 right-1  h-4 w-4 text-blue-600 rounded"
//                 />
//                 <div className="flex flex-col items-start space-y-1">
//                   <div className="text-2xl">
//                     {item.type === "folder" ? (
//                       <FiFolder className="text-blue-500" />
//                     ) : (
//                       getFileTypeIcon(item.name)
//                     )}
//                   </div>
//                   <div className="text-sm font-medium text-gray-800 truncate w-full">
//                     {item.name}
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     {formatBytes(getItemSize(item))}
//                   </div>
//                   {item.type === "folder" && (
//                     <div className="text-xs text-gray-400">
//                       {counts.files} files, {counts.folders} folders
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//           {paginatedContents.length === 0 && (
//             <div className="col-span-full text-center text-gray-400 italic">
//               {searchQuery ? "No matching results" : "No files or folders here"}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Pagination Controls */}
//       {totalPages > 1 && (
//         <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-t mt-4">
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className={`text-sm px-3 py-1 rounded ${
//               currentPage === 1
//                 ? "text-gray-300 cursor-not-allowed"
//                 : "text-blue-500 hover:underline"
//             }`}
//           >
//             Previous
//           </button>
//           <span className="text-sm text-gray-600">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={() =>
//               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//             }
//             disabled={currentPage === totalPages}
//             className={`text-sm px-3 py-1 rounded ${
//               currentPage === totalPages
//                 ? "text-gray-300 cursor-not-allowed"
//                 : "text-blue-500 hover:underline"
//             }`}
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MainSection;

import React, { useContext, useEffect, useRef, useState } from "react";
import {
  FiFileText,
  FiImage,
  FiFolder,
  FiFile,
  FiVideo,
  FiArrowLeft,
  FiMoreVertical,
  FiCheckSquare,
  FiSquare,
  FiTrash2,
  FiUpload,
  FiEdit2,
  FiTrash,
} from "react-icons/fi";
import { FileContext } from "../context/FileContext";
import { getUserDeletedFiles } from "./utils/db";
import { FaFileExcel, FaFilePdf } from "react-icons/fa"; // Adjust path if needed
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { getFileById, saveFile } from "./utils/db.js";

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const getFileTypeIcon = (fileName) => {
  if (!fileName) return <FiFile className="text-gray-500 w-5 h-5" />;
  const extension = fileName.toLowerCase().split(".").pop();
  switch (extension) {
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return <FiImage className="text-purple-500 w-5 h-5" />;
    case "mp4":
    case "webm":
      return <FiVideo className="text-pink-500 w-5 h-5" />;
    case "pdf":
      return <FaFilePdf className="text-red-500 mr-2 w-4 h-4" />;
    case "js":
    case "json":
    case "txt":
    case "html":
    case "css":
      return <FiFileText className="text-green-500 w-5 h-5" />;
    case "excel":
    case "spreadsheetml":
    case "xlsx":
      return <FaFileExcel className="text-green-600 mr-2 w-4 h-4" />;
    case "docx":
      return <FiFileText className="text-blue-600 mr-2 w-4 h-4" />;
    default:
      return <FiFile className="text-gray-500 w-5 h-5" />;
  }
};

// 📦 ITEMS PER PAGE SETTINGS
const ITEMS_PER_PAGE = {
  list: 5,
  grid: 15,
};

const MainSection = () => {
  const {
    files,
    currentFolder,
    setCurrentFolder,
    getFullFolder,
    openFile,
    searchQuery,
    renameItem,
    deleteItem,
    getItemSize,
    viewMode, // Added user from context
  } = useContext(FileContext);

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFileItem, setSelectedFileItem] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  const { user, getAccessTokenSilently } = useAuth0();

  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const areAllItemsSelected = () => {
    const allContents = getCurrentContents();
    return (
      allContents.length > 0 &&
      selectedItems.length === allContents.length &&
      allContents.every((item) => selectedItems.includes(item.id))
    );
  };

  const handleBack = () => {
    if (!currentFolder) return;

    const folderObj =
      typeof currentFolder === "string"
        ? getFullFolder(currentFolder)
        : currentFolder;

    if (!folderObj?.parentId) {
      setCurrentFolder(null);
      return;
    }

    const parent = getFullFolder(folderObj.parentId);
    if (parent) {
      setCurrentFolder(parent);
    }
  };

  const getCurrentContents = () => {
    let contents = [];

    if (!currentFolder) {
      contents = files.filter((f) => !f.parentId);
    } else {
      contents = files.filter((f) => f.parentId === currentFolder.id);
    }

    if (searchQuery) {
      contents = contents.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return contents;
  };

  const handleRename = (item) => {
    const lastDotIndex = item.name.lastIndexOf(".");
    const hasExtension = item.type === "file" && lastDotIndex !== -1;

    const baseName = hasExtension
      ? item.name.substring(0, lastDotIndex)
      : item.name;
    const extension = hasExtension ? item.name.substring(lastDotIndex) : "";

    const newBaseName = prompt("Enter new name:", baseName);
    if (newBaseName && newBaseName.trim() !== "") {
      const newFullName = newBaseName.trim() + extension;
      renameItem(item.id, newFullName);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await deleteItem(item);
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item. Please try again.");
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.length} selected items?`
      )
    ) {
      try {
        // Get all selected items
        const itemsToDelete = allContents.filter((item) =>
          selectedItems.includes(item.id)
        );

        // Delete each item
        for (const item of itemsToDelete) {
          await deleteItem(item);
        }

        setSelectedItems([]);
        setIsSelectAll(false);
      } catch (error) {
        console.error("Error deleting selected items:", error);
        alert("Failed to delete some items. Please try again.");
      }
    }
  };

  const toggleItemSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allContents = getCurrentContents();
    if (areAllItemsSelected()) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allContents.map((item) => item.id));
    }
    setIsSelectAll(!areAllItemsSelected());
  };

  const allContents = getCurrentContents();
  const perPage =
    viewMode === "grid" ? ITEMS_PER_PAGE.grid : ITEMS_PER_PAGE.list;
  const totalPages = Math.ceil(allContents.length / perPage);
  const paginatedContents = allContents.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // Count files and folders for each item
  const getItemCounts = (item) => {
    if (item.type === "file") {
      return {
        files: 1,
        folders: 0,
      };
    }

    // For folders, count their contents
    const folderContents = files.filter((f) => f.parentId === item.id);
    return {
      files: folderContents.filter((f) => f.type === "file").length,
      folders: folderContents.filter((f) => f.type === "folder").length,
    };
  };

  // Total counts for display
  const totalFiles = allContents.filter((item) => item.type === "file").length;
  const totalFolders = allContents.filter(
    (item) => item.type === "folder"
  ).length;
  const selectedFiles = selectedItems.filter((id) => {
    const item = allContents.find((item) => item.id === id);
    return item?.type === "file";
  }).length;
  const selectedFolders = selectedItems.filter((id) => {
    const item = allContents.find((item) => item.id === id);
    return item?.type === "folder";
  }).length;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [allContents, totalPages]);

  const handleFileUpload = async (item) => {
    try {
      setIsUploading(true);

      if (!user?.email) {
        throw new Error("User not authenticated");
      }

      // Get the complete file data from IndexedDB
      const fileData = await getFileById(user.email, item.id);

      if (!fileData) {
        throw new Error("File not found in database");
      }

      // Check if file is already uploaded to Google Drive
      if (fileData.googleDriveUrl || fileData.uploadedToGoogleDrive) {
        alert("File is already uploaded to Google Drive!");
        return;
      }

      // Prepare the file content for upload - handle both content and URL cases
      let fileContent;
      let fileName = fileData.name;
      let mimeType = fileData.fileType;

      if (fileData.content && fileData.content.startsWith("data:")) {
        // Handle base64 data URL
        const base64Data = fileData.content.split(",")[1];
        const byteString = atob(base64Data);
        mimeType = fileData.content.match(/^data:(.*?);/)[1];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        fileContent = new Blob([ab], { type: mimeType });
      } else if (fileData.url) {
        // Handle files stored as URLs (like Google Sheets)

        // Check if this is a CORS-restricted domain
        const urlObj = new URL(fileData.url);
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
          console.log(
            "CORS-restricted domain detected, using proxy for upload"
          );
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(
            fileData.url
          )}`;
          response = await fetch(proxyUrl);
        } else {
          // Try direct fetch first
          try {
            response = await fetch(fileData.url);
          } catch (directError) {
            console.log(
              "Direct fetch failed, trying CORS proxy:",
              directError.message
            );
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(
              fileData.url
            )}`;
            response = await fetch(proxyUrl);
          }
        }

        if (!response.ok) {
          throw new Error(
            `Failed to fetch file from URL: ${response.status} ${response.statusText}`
          );
        }

        fileContent = await response.blob();
        // If mimeType isn't set, get it from the response
        if (!mimeType) {
          mimeType = response.headers.get("content-type");
        }
      } else {
        // Handle other binary data or Blob
        fileContent =
          fileData.content instanceof Blob
            ? fileData.content
            : new Blob([fileData.content || ""], {
                type: mimeType || "application/octet-stream",
              });
      }

      // Create FormData for the upload
      const formData = new FormData();
      formData.append("file", fileContent, fileName);
      formData.append("name", fileName);
      formData.append("mimeType", mimeType || "application/octet-stream");
      formData.append("parentId", fileData.parentId || "");
      formData.append("userEmail", user.email);

      const token = await getAccessTokenSilently();
      const response = await axios.post(
        "http://localhost:8000/upload-file-to-google-drive",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Google Drive upload successful:", response.data);

      // Update the file in IndexedDB with the Google Drive URL
      if (response.data.publicUrl) {
        const updatedFileData = {
          ...fileData,
          url: response.data.publicUrl,
          content: null, // Remove base64 content since we now have a URL
          uploadedToGoogleDrive: true,
          googleDriveUrl: response.data.publicUrl,
          size: fileContent.size, // Preserve the file size
        };

        await saveFile(user.email, updatedFileData);
        console.log("✅ File updated in database with Google Drive URL");
      }

      alert("File uploaded to Google Drive successfully");
    } catch (error) {
      console.error("❌ Google Drive upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setMenuOpenId(null);
    }
  };

  // const handleDeleteFromGoogleDrive = async (item) => {
  //   if (!item.uploadedToGoogleDrive || !item.url) {
  //     alert("🚫 This file is not uploaded to Google Drive.");
  //     return;
  //   }

  //   const fileIdMatch = item.url.match(/\/d\/(.+?)\//);
  //   const fileId = fileIdMatch ? fileIdMatch[1] : null;

  //   if (!fileId) {
  //     alert("❌ Could not extract file ID from URL.");
  //     return;
  //   }

  //   try {
  //     const res = await fetch(
  //       `http://localhost:8000/delete-file-from-google-drive/${fileId}`,
  //       {
  //         method: "DELETE",
  //       }
  //     );

  //     const data = await res.json();

  //     if (res.ok) {
  //       alert("✅ File deleted from Google Drive.");
  //       // Optional: refresh the file list or update state here
  //     } else {
  //       alert(`❌ Error: ${data.error}`);
  //     }
  //   } catch (error) {
  //     console.error("Error deleting file from Google Drive:", error);
  //     alert("❌ Failed to delete file from Google Drive.");
  //   }
  // };

  // const handleFileUpload = async (item, folderId) => {
  //   try {
  //     setIsUploading(true);

  //     if (!user?.email) throw new Error("User not authenticated");

  //     const fileData = await getFileById(user.email, item.id);
  //     if (!fileData) throw new Error("File not found in database");

  //     if (fileData.googleDriveUrl || fileData.uploadedToGoogleDrive) {
  //       alert("File is already uploaded to Google Drive!");
  //       return;
  //     }

  //     let fileContent;
  //     let fileName = fileData.name;
  //     let mimeType = fileData.fileType;

  //     if (fileData.content && fileData.content.startsWith("data:")) {
  //       const base64Data = fileData.content.split(",")[1];
  //       const byteString = atob(base64Data);
  //       mimeType = fileData.content.match(/^data:(.*?);/)[1];
  //       const ab = new ArrayBuffer(byteString.length);
  //       const ia = new Uint8Array(ab);
  //       for (let i = 0; i < byteString.length; i++) {
  //         ia[i] = byteString.charCodeAt(i);
  //       }
  //       fileContent = new Blob([ab], { type: mimeType });
  //     } else if (fileData.url) {
  //       const urlObj = new URL(fileData.url);
  //       const corsRestrictedDomains = [
  //         "github.com",
  //         "education.github.com",
  //         "raw.githubusercontent.com",
  //         "gist.githubusercontent.com",
  //       ];
  //       const isCorsRestricted = corsRestrictedDomains.some((domain) =>
  //         urlObj.hostname.includes(domain)
  //       );

  //       let response;
  //       if (isCorsRestricted) {
  //         response = await fetch(
  //           `https://corsproxy.io/?${encodeURIComponent(fileData.url)}`
  //         );
  //       } else {
  //         try {
  //           response = await fetch(fileData.url);
  //         } catch (err) {
  //           response = await fetch(
  //             `https://corsproxy.io/?${encodeURIComponent(fileData.url)}`
  //           );
  //         }
  //       }

  //       if (!response.ok) {
  //         throw new Error(`Failed to fetch file from URL: ${response.status}`);
  //       }

  //       fileContent = await response.blob();
  //       if (!mimeType) {
  //         mimeType = response.headers.get("content-type");
  //       }
  //     } else {
  //       fileContent =
  //         fileData.content instanceof Blob
  //           ? fileData.content
  //           : new Blob([fileData.content || ""], {
  //               type: mimeType || "application/octet-stream",
  //             });
  //     }

  //     const formData = new FormData();
  //     formData.append("file", fileContent, fileName);
  //     formData.append("name", fileName);
  //     formData.append("mimeType", mimeType || "application/octet-stream");
  //     formData.append("userEmail", user.email);
  //     formData.append("folderId", folderId); // ✨ New

  //     const token = await getAccessTokenSilently();
  //     const response = await axios.post(
  //       "http://localhost:8000/upload-file-to-google-drive",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     console.log("✅ Google Drive upload successful:", response.data);

  //     if (response.data.publicUrl) {
  //       const updatedFileData = {
  //         ...fileData,
  //         url: response.data.publicUrl,
  //         content: null,
  //         uploadedToGoogleDrive: true,
  //         googleDriveUrl: response.data.publicUrl,
  //         size: fileContent.size,
  //       };

  //       await saveFile(user.email, updatedFileData);
  //       console.log("✅ File updated in database");
  //     }

  //     alert("File uploaded to Google Drive successfully");
  //   } catch (error) {
  //     console.error("❌ Upload failed:", error);
  //     alert(`Upload failed: ${error.message}`);
  //   } finally {
  //     setIsUploading(false);
  //     setShowFolderModal(false);
  //     setSelectedFolderId(null);
  //     setSelectedFileItem(null);
  //     setMenuOpenId(null);
  //   }
  // };

  const handleDeleteFromGoogleDrive = async (item) => {
    console.log("🧩 Deleting file from Google Drive:", item);

    if (!item.uploadedToGoogleDrive || !item.url) {
      alert("🚫 This file is not uploaded to Google Drive.");
      console.log("❌ uploadedToGoogleDrive or url is missing", {
        uploadedToGoogleDrive: item.uploadedToGoogleDrive,
        url: item.url,
      });
      return;
    }

    const fileIdMatch = item.url.match(/\/d\/(.+?)\//);
    const fileId = fileIdMatch ? fileIdMatch[1] : null;

    console.log("📦 Extracted fileId from URL:", fileId);

    if (!fileId) {
      alert("❌ Could not extract file ID from URL.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/delete-file-from-google-drive/${fileId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();
      console.log("🗑️ Response from backend:", data);

      if (res.ok) {
        alert("✅ File deleted from Google Drive.");

        // 👇 Update IndexedDB after deletion
        const fileData = await getFileById(user.email, item.id);

        if (fileData) {
          const updatedFileData = {
            ...fileData,
            uploadedToGoogleDrive: false,
            googleDriveUrl: null,
            url: null,
          };

          await saveFile(user.email, updatedFileData);
          console.log("📝 File updated in IndexedDB after deletion");
        } else {
          console.warn("⚠️ File not found in IndexedDB for update");
        }
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error(
        "❌ Frontend error deleting file from Google Drive:",
        error
      );
      alert("❌ Failed to delete file from Google Drive.");
    }
  };

  return (
    <div className="flex-1 p-6">
      {/* Top Bar with Selection Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSelectAll}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              areAllItemsSelected()
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-colors`}
          >
            {areAllItemsSelected() ? (
              <FiCheckSquare className="w-5 h-5" />
            ) : (
              <FiSquare className="w-5 h-5" />
            )}
            <span>{areAllItemsSelected() ? "Unselect All" : "Select All"}</span>
          </button>

          {selectedItems.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              <FiTrash2 className="w-5 h-5" />
              <span>Delete Selected</span>
            </button>
          )}
        </div>

        <h2 className="text-xl font-semibold">
          {currentFolder
            ? typeof currentFolder === "string"
              ? getFullFolder(currentFolder)?.name
              : currentFolder.name
            : "Files Management System"}
        </h2>

        {currentFolder && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
      </div>

      {/* File/Folder Count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {allContents.length} items ({totalFiles} files, {totalFolders}{" "}
        folders)
        {selectedItems.length > 0 && (
          <span className="ml-4">
            Selected: {selectedItems.length} ({selectedFiles} files,{" "}
            {selectedFolders} folders)
          </span>
        )}
      </div>

      {viewMode === "list" ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className=" py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {/* <input
                    type="checkbox"
                    checked={
                      isSelectAll && selectedItems.length === allContents.length
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded"
                  /> */}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Files
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Folders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedContents.map((item) => {
                const counts = getItemCounts(item);
                return (
                  <tr
                    key={item.id}
                    className={
                      selectedItems.includes(item.id) ? "bg-blue-50" : ""
                    }
                  >
                    <td className="px-2 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </td>
                    <td
                      className="px-0 py-4 whitespace-nowrap flex items-center cursor-pointer"
                      onClick={() => {
                        if (item.type === "folder") {
                          setCurrentFolder(item);
                        } else {
                          openFile(item);
                        }
                      }}
                    >
                      {item.type === "folder" ? (
                        <FiFolder className="w-5 h-5 mr-2 text-blue-500" />
                      ) : (
                        <span className="mr-2">
                          {getFileTypeIcon(item.name)}
                        </span>
                      )}
                      <span className="text-sm text-gray-800">{item.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatBytes(getItemSize(item))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {counts.files}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {counts.folders}
                    </td>
                    <td className="relative px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(item.id);
                        }}
                      >
                        <FiMoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      {menuOpenId === item.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-6 top-[-40px] w-48 bg-white border border-gray-200 rounded-md shadow-lg z-100 "
                        >
                          <button
                            className="flex items-center gap-2 w-full text-left px-4 py-1 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileUpload(item);
                              setMenuOpenId(null);
                            }}
                          >
                            <FiUpload className="w-4 h-4" />
                            Upload File
                          </button>

                          <button
                            className="flex items-center gap-2 w-full text-left px-4 py-1 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRename(item);
                              setMenuOpenId(null);
                            }}
                          >
                            <FiEdit2 className="w-4 h-4" />
                            Rename
                          </button>

                          <button
                            className="flex items-center gap-2 w-full text-left px-4 py-1 text-sm text-red-600 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item);
                              setMenuOpenId(null);
                            }}
                          >
                            <FiTrash2 className="w-4 h-4" />
                            Delete
                          </button>

                          {/* <button
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFromGoogleDrive(item);
                              setMenuOpenId(null);
                            }}
                          >
                            <FiTrash className="w-4 h-4" />
                            Delete Drive File
                          </button> */}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {paginatedContents.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-gray-400 italic text-center"
                  >
                    {searchQuery
                      ? "No matching results"
                      : "No files or folders here"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {paginatedContents.map((item) => {
            const counts = getItemCounts(item);
            return (
              <div
                key={item.id}
                className={`border p-4 rounded shadow bg-white cursor-pointer hover:shadow-md transition relative ${
                  selectedItems.includes(item.id) ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={(e) => {
                  // Don't navigate if clicking on checkbox
                  if (e.target.type !== "checkbox") {
                    if (item.type === "folder") {
                      setCurrentFolder(item);
                    } else {
                      openFile(item);
                    }
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-1 right-1  h-4 w-4 text-blue-600 rounded"
                />
                <div className="flex flex-col items-start space-y-1">
                  <div className="text-2xl">
                    {item.type === "folder" ? (
                      <FiFolder className="text-blue-500" />
                    ) : (
                      getFileTypeIcon(item.name)
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-800 truncate w-full">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatBytes(getItemSize(item))}
                  </div>
                  {item.type === "folder" && (
                    <div className="text-xs text-gray-400">
                      {counts.files} files, {counts.folders} folders
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {paginatedContents.length === 0 && (
            <div className="col-span-full text-center text-gray-400 italic">
              {searchQuery ? "No matching results" : "No files or folders here"}
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-t mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`text-sm px-3 py-1 rounded ${
              currentPage === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-blue-500 hover:underline"
            }`}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`text-sm px-3 py-1 rounded ${
              currentPage === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-blue-500 hover:underline"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MainSection;
