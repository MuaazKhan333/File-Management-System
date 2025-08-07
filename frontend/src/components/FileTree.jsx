// import React, { useState, useContext, useEffect, useRef } from "react";
// import {
//   FiChevronDown,
//   FiChevronRight,
//   FiFolder,
//   FiFile,
//   FiMoreVertical,
//   FiFileText,
// } from "react-icons/fi";
// import {
//   FaFilePdf,
//   FaFileWord,
//   FaFileExcel,
//   FaFileImage,
//   FaFileAlt,
// } from "react-icons/fa";
// import { FileContext } from "../context/FileContext";

// const truncateFileName = (name, length = 15) => {
//   if (!name) return "";
//   if (name.length <= length) return name;
//   return `${name.substring(0, length)}...`;
// };

// const FileTree = ({ expandedFolders = [], newFileId = null }) => {
//   const {
//     files, // These should already be user-filtered
//     currentFolder,
//     setCurrentFolder,
//     renameItem,
//     deleteItem,
//     openFile,
//     userEmail, // Make sure this is coming from FileContext
//   } = useContext(FileContext);

//   const [localExpandedFolders, setLocalExpandedFolders] = useState(new Set());
//   const [menuOpenId, setMenuOpenId] = useState(null);
//   const newFileRef = useRef(null);

//   useEffect(() => {
//     console.log("Files updated in FileTree:", files);
//   }, [files]);

//   useEffect(() => {
//     if (expandedFolders.length > 0) {
//       setLocalExpandedFolders(new Set(expandedFolders));
//     }
//   }, [expandedFolders]);

//   useEffect(() => {
//     if (newFileRef.current) {
//       newFileRef.current.scrollIntoView({
//         behavior: "smooth",
//         block: "center",
//       });
//     }
//   }, [newFileId]);

//   const getFileIcon = (fileType) => {
//     if (!fileType) return <FaFileAlt className="text-gray-500 mr-2 w-4 h-4" />;

//     if (fileType.includes("pdf"))
//       return <FaFilePdf className="text-red-500 mr-2 w-4 h-4" />;
//     if (fileType.includes("doc") || fileType.includes("document"))
//       return <FiFileText className="text-blue-600 mr-2 w-4 h-4" />;
//     if (fileType.includes("xlsx") || fileType.includes("spreadsheetml"))
//       return <FaFileExcel className="text-green-600 mr-2 w-4 h-4" />;
//     if (fileType.startsWith("image/"))
//       return <FaFileImage className="text-purple-500 mr-2 w-4 h-4" />;

//     return <FaFileAlt className="text-gray-500 mr-2 w-4 h-4" />;
//   };

//   const toggleFolder = (folderId) => {
//     const newSet = new Set(localExpandedFolders);
//     newSet.has(folderId) ? newSet.delete(folderId) : newSet.add(folderId);
//     setLocalExpandedFolders(newSet);
//   };

//   const handleFileClick = (item) => {
//     console.log("File clicked:", item);
//     if (item.type === "folder") {
//       setCurrentFolder(item);
//       toggleFolder(item.id);
//     } else if (item.name.endsWith(".txt")) {
//       // Only open .txt files in editor
//       console.log("Opening text note:", item.id);
//       window.location.href = `/notes/${item.id}`;
//     } else {
//       console.log("Opening regular file:", item.id);
//       openFile(item); // Open all other files in new tab
//     }
//   };
//   const handleRename = (item) => {
//     let currentName = item.name;
//     let extension = "";

//     if (item.type === "file") {
//       const lastDotIndex = currentName.lastIndexOf(".");
//       if (lastDotIndex > 0) {
//         extension = currentName.substring(lastDotIndex);
//         currentName = currentName.substring(0, lastDotIndex);
//       }
//     }

//     const newName = prompt("Enter new name:", currentName);

//     if (newName?.trim()) {
//       const finalName =
//         item.type === "file" && extension
//           ? `${newName.trim()}${extension}`
//           : newName.trim();

//       renameItem(item.id, finalName);
//     }

//     setMenuOpenId(null);
//   };

//   const handleDelete = async (item) => {
//     if (!item?.id) {
//       console.error("Invalid item for deletion:", item);
//       return;
//     }

//     if (window.confirm(`Delete "${item.name || "this item"}"?`)) {
//       try {
//         const itemToDelete = {
//           id: item.id,
//           name:
//             item.name ||
//             (item.type === "folder" ? "Unnamed Folder" : "Unnamed File"),
//           type: item.type || "file",
//           parentId: item.parentId || null,
//           ...item,
//         };

//         // Pass userEmail if deleteItem expects it
//         await deleteItem(itemToDelete, userEmail);
//       } catch (error) {
//         console.error("Failed to delete item:", error);
//         alert("Failed to delete item. Please try again.");
//       }
//       setMenuOpenId(null);
//     }
//   };

//   const renderTree = (parentId = null, depth = 0) => {
//     const children = files.filter((item) => item.parentId === parentId);

//     return children.map((item) => {
//       const isFolder = item.type === "folder";
//       const isExpanded = localExpandedFolders.has(item.id);
//       const isCurrent =
//         currentFolder &&
//         (typeof currentFolder === "string"
//           ? currentFolder === item.id
//           : currentFolder.id === item.id);

//       return (
//         <div
//           key={item.id}
//           className={depth === 0 ? "py-1" : `ml-${depth * 4} py-1`}
//         >
//           <div
//             ref={item.id === newFileId ? newFileRef : null}
//             className={`flex items-center px-2 py-1 rounded cursor-pointer transition-colors ${
//               isCurrent ? "bg-blue-100" : "hover:bg-gray-200"
//             }`}
//             onClick={() => {
//               if (isFolder) {
//                 setCurrentFolder(item);
//                 toggleFolder(item.id);
//               } else {
//                 handleFileClick(item);
//                 // Use the new openFile handler
//               }
//             }}
//           >
//             {isFolder ? (
//               isExpanded ? (
//                 <FiChevronDown className="mr-1 text-gray-500 w-4 h-4" />
//               ) : (
//                 <FiChevronRight className="mr-1 text-gray-500 w-4 h-4" />
//               )
//             ) : (
//               <div className="w-4 mr-1" />
//             )}

//             {/* {isFolder ? (
//               <FiFolder className="text-blue-500 mr-2 w-4 h-4" />
//             ) : (
//               <FiFile className="text-gray-500 mr-2 w-4 h-4" />
//             )} */}
//             {isFolder ? (
//               <FiFolder className="text-blue-500 mr-2 w-4 h-4" />
//             ) : (
//               getFileIcon(item.name)
//             )}

//             <span className="text-sm text-gray-800 flex-1">
//               {truncateFileName(item.name)}
//             </span>

//             <div className="relative">
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setMenuOpenId(menuOpenId === item.id ? null : item.id);
//                 }}
//               >
//                 <FiMoreVertical className="text-gray-400 hover:text-black w-4 h-4" />
//               </button>

//               {menuOpenId === item.id && (
//                 <div className="absolute right-0 z-10 mt-1 w-28 bg-white border border-gray-200 rounded shadow-md">
//                   <button
//                     className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleRename(item);
//                     }}
//                   >
//                     Rename
//                   </button>
//                   <button
//                     className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100 text-red-500"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleDelete(item);
//                     }}
//                   >
//                     Delete
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {isFolder && isExpanded && (
//             <div className="ml-4">{renderTree(item.id, depth + 1)}</div>
//           )}
//         </div>
//       );
//     });
//   };

//   return <div className="overflow-y-auto">{renderTree(null)}</div>;
// };

// export default FileTree;

import React, { useState, useContext, useEffect, useRef } from "react";
import {
  FiChevronDown,
  FiChevronRight,
  FiFolder,
  FiMoreVertical,
} from "react-icons/fi";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileAlt,
} from "react-icons/fa";
import { FileContext } from "../context/FileContext";

const truncateFileName = (name, length = 15) => {
  if (!name) return "";
  return name.length <= length ? name : `${name.substring(0, length)}...`;
};

const FileTree = ({ expandedFolders = [], newFileId = null }) => {
  const {
    files,
    currentFolder,
    setCurrentFolder,
    renameItem,
    deleteItem,
    openFile,
    userEmail, // Changed from userEmail to user (more common in your context)
  } = useContext(FileContext);

  const [localExpandedFolders, setLocalExpandedFolders] = useState(new Set());
  const [menuOpenId, setMenuOpenId] = useState(null);
  const newFileRef = useRef(null);

  useEffect(() => {
    if (expandedFolders.length > 0) {
      setLocalExpandedFolders(new Set(expandedFolders));
    }
  }, [expandedFolders]);

  useEffect(() => {
    if (newFileRef.current && newFileId) {
      newFileRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [newFileId]);

  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt className="text-gray-500 mr-2 w-4 h-4" />;

    const lowerName = fileName.toLowerCase();

    if (lowerName.endsWith(".pdf"))
      return <FaFilePdf className="text-red-500 mr-2 w-4 h-4" />;
    if (lowerName.endsWith(".doc") || lowerName.endsWith(".docx"))
      return <FaFileWord className="text-blue-600 mr-2 w-4 h-4" />;
    if (lowerName.endsWith(".xlsx"))
      return <FaFileExcel className="text-green-600 mr-2 w-4 h-4" />;
    if (
      lowerName.endsWith(".jpg") ||
      lowerName.endsWith(".jpeg") ||
      lowerName.endsWith(".png")
    ) {
      return <FaFileImage className="text-purple-500 mr-2 w-4 h-4" />;
    }
    if (lowerName.endsWith(".txt"))
      return <FaFileAlt className="text-gray-700 mr-2 w-4 h-4" />;

    return <FaFileAlt className="text-gray-500 mr-2 w-4 h-4" />;
  };

  const toggleFolder = (folderId) => {
    setLocalExpandedFolders((prev) => {
      const newSet = new Set(prev);
      newSet.has(folderId) ? newSet.delete(folderId) : newSet.add(folderId);
      return newSet;
    });
  };

  const handleFileClick = (item) => {
    if (item.type === "folder") {
      setCurrentFolder(item);
      toggleFolder(item.id);
    } else {
      // Let the context's openFile handle all file types
      openFile(item);
    }
  };

  // ... (keep your existing handleRename and handleDelete functions)

  const handleRename = (item) => {
    let currentName = item.name;
    let extension = "";

    if (item.type === "file") {
      const lastDotIndex = currentName.lastIndexOf(".");
      if (lastDotIndex > 0) {
        extension = currentName.substring(lastDotIndex);
        currentName = currentName.substring(0, lastDotIndex);
      }
    }

    const newName = prompt("Enter new name:", currentName);

    if (newName?.trim()) {
      const finalName =
        item.type === "file" && extension
          ? `${newName.trim()}${extension}`
          : newName.trim();

      renameItem(item.id, finalName);
    }

    setMenuOpenId(null);
  };

  const handleDelete = async (item) => {
    if (!item?.id) {
      console.error("Invalid item for deletion:", item);
      return;
    }

    if (window.confirm(`Delete "${item.name || "this item"}"?`)) {
      try {
        const itemToDelete = {
          id: item.id,
          name:
            item.name ||
            (item.type === "folder" ? "Unnamed Folder" : "Unnamed File"),
          type: item.type || "file",
          parentId: item.parentId || null,
          ...item,
        };

        // Pass userEmail if deleteItem expects it
        await deleteItem(itemToDelete, userEmail);
      } catch (error) {
        console.error("Failed to delete item:", error);
        alert("Failed to delete item. Please try again.");
      }
      setMenuOpenId(null);
    }
  };

  const renderTree = (parentId = null, depth = 0) => {
    return files
      .filter((item) => item.parentId === parentId)
      .map((item) => {
        const isFolder = item.type === "folder";
        const isExpanded = localExpandedFolders.has(item.id);
        const isCurrent = currentFolder?.id === item.id;

        return (
          <div
            key={item.id}
            className={`${depth > 0 ? `ml-${depth * 4}` : ""} py-1`}
          >
            <div
              ref={item.id === newFileId ? newFileRef : null}
              className={`flex items-center px-2 py-1 rounded cursor-pointer transition-colors ${
                isCurrent ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
              onClick={() => handleFileClick(item)}
            >
              {isFolder ? (
                <>
                  {isExpanded ? (
                    <FiChevronDown className="mr-1 text-gray-500 w-4 h-4" />
                  ) : (
                    <FiChevronRight className="mr-1 text-gray-500 w-4 h-4" />
                  )}
                  <FiFolder className="text-blue-500 mr-2 w-4 h-4" />
                </>
              ) : (
                <>
                  <div className="w-4 mr-1" />
                  {getFileIcon(item.name)}
                </>
              )}

              <span className="text-sm text-gray-800 flex-1">
                {truncateFileName(item.name)}
              </span>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === item.id ? null : item.id);
                  }}
                  className="p-1"
                >
                  <FiMoreVertical className="text-gray-400 hover:text-gray-600 w-4 h-4" />
                </button>

                {menuOpenId === item.id && (
                  <div className="absolute right-0 z-10 mt-1 w-28 bg-white border border-gray-200 rounded shadow-md">
                    <button
                      className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(item);
                      }}
                    >
                      Rename
                    </button>
                    <button
                      className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isFolder && isExpanded && renderTree(item.id, depth + 1)}
          </div>
        );
      });
  };

  return <div className="overflow-y-auto h-full">{renderTree()}</div>;
};

export default FileTree;
