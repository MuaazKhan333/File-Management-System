

import React, { useContext, useState } from "react";
import { FileContext } from "../context/FileContext";
import {
  FiPlus,
  FiFolder,
  FiFile,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";

const Sidebar = () => {
  const { files, currentFolder, setCurrentFolder, addFile, addFolder } =
    useContext(FileContext);

  const [dropdown, setDropdown] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputType, setInputType] = useState(null); // 'file' or 'folder'
  const [inputValue, setInputValue] = useState("");
  const [openFolders, setOpenFolders] = useState([]);

  const toggleFolder = (id) => {
    setOpenFolders((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    if (!inputValue.trim()) return;

    if (inputType === "file") {
      addFile(inputValue.trim(), currentFolder);
    } else {
      addFolder(inputValue.trim(), currentFolder);
    }

    // Reset UI
    setInputVisible(false);
    setInputValue("");
    setInputType(null);
    setDropdown(false);
  };

  const renderFiles = (parentId = null, depth = 0) => {
    return files
      .filter((f) => f.parentId === parentId)
      .sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "folder" ? -1 : 1; // folders before files
      })
      .map((item) => {
        const isFolder = item.type === "folder";
        const isOpen = openFolders.includes(item.id);
        const isSelected = currentFolder === item.id;

        return (
          <div key={item.id} className="ml-2">
            <div
              className={`flex items-center px-2 py-1 rounded cursor-pointer hover:bg-gray-200 ${
                isSelected ? "bg-blue-100" : ""
              }`}
              onClick={() => {
                if (isFolder) toggleFolder(item.id);
                setCurrentFolder(item.id);
              }}
            >
              {isFolder && (
                <>
                  {isOpen ? (
                    <FiChevronDown className="mr-1 text-gray-500" />
                  ) : (
                    <FiChevronRight className="mr-1 text-gray-500" />
                  )}
                </>
              )}
              {isFolder ? (
                <FiFolder className="text-blue-500 mr-2" />
              ) : (
                <FiFile className="text-gray-500 mr-2" />
              )}
              <span className="text-sm text-gray-800">{item.name}</span>
            </div>
            {isFolder && isOpen && (
              <div className="ml-4">{renderFiles(item.id, depth + 1)}</div>
            )}
          </div>
        );
      });
  };

  return (
    <div className="w-64 bg-gray-100 p-4 h-screen relative">
      {/* Add New Button */}
      <div className="relative mb-6">
        <button
          className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={() => setDropdown(!dropdown)}
        >
          <FiPlus className="w-4 h-4" />
          <span>Add New</span>
        </button>

        {dropdown && (
          <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg z-10">
            <div className="p-2 border-b">
              <button
                className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                onClick={() => {
                  setInputType("file");
                  setInputVisible(true);
                  setDropdown(false);
                }}
              >
                Add File
              </button>
              <button
                className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                onClick={() => {
                  setInputType("folder");
                  setInputVisible(true);
                  setDropdown(false);
                }}
              >
                Add Folder
              </button>
            </div>
          </div>
        )}

        {inputVisible && (
          <div className="absolute top-16 left-0 w-full bg-white rounded-md shadow-lg z-20 p-4">
            <div className="mb-2 text-sm text-gray-700">
              {inputType === "file" ? "Enter file name:" : "Enter folder name:"}
            </div>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                inputType === "file" ? "e.g. index.js" : "e.g. components"
              }
            />
            <div className="mt-3 flex justify-end space-x-2">
              <button
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => {
                  setInputVisible(false);
                  setInputValue("");
                  setInputType(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleAdd}
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render Hierarchical Files */}
      <div>{renderFiles()}</div>
    </div>
  );
};

export default Sidebar;
