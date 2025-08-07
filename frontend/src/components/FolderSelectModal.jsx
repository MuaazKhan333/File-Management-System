import React, { useState } from "react";
import { FiChevronDown, FiChevronRight, FiFolder } from "react-icons/fi";

const FolderSelectModal = ({ folders, onSelect, onCancel, user }) => {
  const [openFolders, setOpenFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  const toggleFolder = (id) => {
    setOpenFolders((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleSelect = (id) => {
    console.log("📁 Folder selected:", id);
    setSelectedFolderId(id);
  };

  const folderTree = [];
  const buildTree = (parentId = null, level = 0) => {
    folders
      .filter((folder) => folder.parentId === parentId)
      .forEach((folder) => {
        const isOpen = openFolders.includes(folder.id);
        const hasChildren = folders.some((f) => f.parentId === folder.id);
        const isSelected = selectedFolderId === folder.id;

        folderTree.push(
          <div
            key={folder.id}
            style={{ marginLeft: level * 16 }}
            className="mb-1"
          >
            <div
              className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                isSelected ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
              onClick={() => handleSelect(folder.id)}
            >
              <div className="flex items-center w-full">
                {hasChildren ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFolder(folder.id);
                    }}
                  >
                    {isOpen ? (
                      <FiChevronDown className="text-gray-500 mr-1" />
                    ) : (
                      <FiChevronRight className="text-gray-500 mr-1" />
                    )}
                  </span>
                ) : (
                  <span className="w-4 mr-1" />
                )}
                <FiFolder className="text-blue-500 mr-2" />
                <span className="text-sm text-gray-800">{folder.name}</span>
              </div>
            </div>
          </div>
        );

        if (isOpen && hasChildren) {
          buildTree(folder.id, level + 1);
        }
      });
  };

  buildTree();

  const handleAdd = () => {
    const parentId = selectedFolderId || null;
    console.log(
      "➕ Add button clicked. Selected Folder ID (null means root):",
      parentId
    );

    if (!user || !user.email) {
      console.warn("🚨 User is missing in FolderSelectModal during add.");
      alert("User not logged in. Cannot add file.");
      return;
    }

    onSelect(parentId, user); // ✅ Now includes user context
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Select Folder
        </h2>
        <div className="mb-6 space-y-1">{folderTree}</div>
        <div className="flex justify-between items-center">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Here
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderSelectModal;
