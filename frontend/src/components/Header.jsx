// header.js

import React, { useContext, useEffect, useState } from "react";
import {
  FiSearch,
  FiEye,
  FiTrash2,
  FiMoreVertical,
  FiChevronRight,
  FiChevronDown,
  FiFile,
  FiFolder,
  FiX,
  FiCheck,
} from "react-icons/fi";

import { BsListUl, BsGrid3X3Gap } from "react-icons/bs";
import { FileContext } from "../context/FileContext";
import { deleteDeletedFileById } from "../components/utils/db.js";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import {
  FaFileAlt,
  FaFileExcel,
  FaFileImage,
  FaFilePdf,
  FaFileWord,
} from "react-icons/fa";
// import { useContext, useEffect, useState } from "react";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [showBin, setShowBin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [additionalAccounts, setAdditionalAccounts] = useState([]);
  const [selectedBinItems, setSelectedBinItems] = useState([]);
  const navigate = useNavigate();

  const { logout, loginWithRedirect, isAuthenticated, user } = useAuth0();

  const {
    setSearchQuery,
    setSortBy,
    viewMode,
    setViewMode,
    deletedItems,
    restoreItem,
    setDeletedItems,
    openFile,
  } = useContext(FileContext);

  useEffect(() => {
    const closeDropdowns = () => {
      setDropdownOpen({});
      setShowProfile(false);
    };
    document.addEventListener("click", closeDropdowns);
    document.addEventListener("scroll", closeDropdowns);
    return () => {
      document.removeEventListener("click", closeDropdowns);
      document.removeEventListener("scroll", closeDropdowns);
    };
  }, []);

  useEffect(() => {
    const savedAccounts =
      JSON.parse(localStorage.getItem("additionalAccounts")) || [];
    setAdditionalAccounts(savedAccounts);
  }, [isAuthenticated]);

  const handleAddAccount = () => {
    if (user && user.email) {
      const saved =
        JSON.parse(localStorage.getItem("additionalAccounts")) || [];
      if (!saved.includes(user.email)) {
        saved.push(user.email);
        localStorage.setItem("additionalAccounts", JSON.stringify(saved));
        setAdditionalAccounts(saved);
      }
    }
    loginWithRedirect({ redirectUri: window.location.origin });
  };

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBinItemSelection = (id) => {
    setSelectedBinItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllBinItems = () => {
    if (selectedBinItems.length === deletedItems.length) {
      setSelectedBinItems([]);
    } else {
      setSelectedBinItems(deletedItems.map((item) => item.id));
    }
  };

  const handleRestoreSelected = async () => {
    for (const id of selectedBinItems) {
      await restoreItem(id);
    }
    setSelectedBinItems([]);
  };

  const handleDeleteSelected = async () => {
    if (
      window.confirm(
        `Permanently delete ${selectedBinItems.length} selected items?`
      )
    ) {
      for (const id of selectedBinItems) {
        await deleteDeletedFileById(user?.email, id);
      }
      setDeletedItems((prev) =>
        prev.filter((item) => !selectedBinItems.includes(item.id))
      );
      setSelectedBinItems([]);
    }
  };
  const handleRestoreAll = async () => {
    if (deletedItems.length === 0) return;

    // First collect all root-level items (those without parents in the recycle bin)
    const rootItems = deletedItems.filter(
      (item) => !deletedItems.some((i) => i.id === item.parentId)
    );

    // Then restore each root item and its children
    for (const rootItem of rootItems) {
      await restoreItem(rootItem.id);
    }

    // Update the UI by emptying the recycle bin
    setDeletedItems([]);
    setShowBin(false);
  };

  const handleEmptyBin = async () => {
    if (!window.confirm("Empty recycle bin permanently?")) return;

    for (const item of deletedItems) {
      await deleteDeletedFileById(user?.email, item.id); // ✅ FIXED: pass user.email
    }

    setDeletedItems([]);
    setShowBin(false);
  };

  const handleDeletePermanently = async (id) => {
    if (!window.confirm("Delete this item permanently?")) return;

    const collectItems = (parentId, allItems = []) => {
      deletedItems.forEach((item) => {
        if (item.id === parentId) {
          allItems.push(item);
        }
        if (item.parentId === parentId) {
          collectItems(item.id, allItems);
        }
      });
      return allItems;
    };

    const toDelete = collectItems(id);

    for (const item of toDelete) {
      await deleteDeletedFileById(user?.email, item.id); // ✅ FIXED: pass user.email
    }

    setDeletedItems((prev) =>
      prev.filter((item) => !toDelete.some((t) => t.id === item.id))
    );
  };

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

  // const renderTree = (parentId = undefined, level = 0) => {
  //   const children = deletedItems.filter((item) =>
  //     parentId === undefined
  //       ? !deletedItems.some((i) => i.id === item.parentId)
  //       : item.parentId === parentId
  //   );

  //   return children.map((item) => {
  //     const hasChildren = deletedItems.some((i) => i.parentId === item.id);
  //     const isExpanded = expandedItems[item.id];
  //     const isDropdownOpen = dropdownOpen[item.id];
  //     const isFolder = item.type === "folder" || item.isFolder || hasChildren;

  //     return (
  //       <div key={item.id} style={{ marginLeft: level * 12 }} className="mb-1">
  //         <div
  //           className={`flex justify-between items-center py-1 px-1 rounded relative z-10 transition-all duration-200 ${
  //             isDropdownOpen ? "bg-gray-100" : ""
  //           }`}
  //         >
  //           <div className="flex items-center gap-1">
  //             {hasChildren && (
  //               <button
  //                 onClick={(e) => {
  //                   e.stopPropagation();
  //                   toggleExpand(item.id);
  //                 }}
  //                 className="text-gray-600 hover:text-gray-800 transition-all duration-200"
  //               >
  //                 {isExpanded ? (
  //                   <FiChevronDown className="w-4 h-4" />
  //                 ) : (
  //                   <FiChevronRight className="w-4 h-4" />
  //                 )}
  //               </button>
  //             )}
  //             <span
  //               className="flex items-center gap-2"
  //               style={{ paddingLeft: level * 12 }}
  //             >
  //               {isFolder ? (
  //                 <FiFolder className="w-4 h-4 text-yellow-500" />
  //               ) : (
  //                 <FiFile className="w-4 h-4 text-blue-500" />
  //               )}
  //               <span className="truncate w-32 text-sm">{item.name}</span>
  //             </span>
  //           </div>

  //           <div className="relative">
  //             <button
  //               onClick={(e) => {
  //                 e.stopPropagation();
  //                 setDropdownOpen((prev) => ({
  //                   ...Object.fromEntries(
  //                     Object.keys(prev).map((k) => [k, false])
  //                   ),
  //                   [item.id]: !prev[item.id],
  //                 }));
  //               }}
  //               className="p-1 text-gray-400 hover:text-gray-600"
  //             >
  //               <FiMoreVertical className="w-4 h-4" />
  //             </button>

  //             {isDropdownOpen && (
  //               <div
  //                 onClick={(e) => e.stopPropagation()}
  //                 className="absolute top-[-20px] right-0 w-24 bg-white border border-gray-200 rounded shadow z-100"
  //               >
  //                 <button
  //                   onClick={() => restoreItem(item.id)}
  //                   className="block w-full h-[40%] text-left px-2 py-2 text-sm hover:bg-gray-200 text-green-600 z-100 cursor-pointer"
  //                 >
  //                   Restore
  //                 </button>
  //                 <button
  //                   onClick={() => handleDeletePermanently(item.id)}
  //                   className="block w-full h-[40%] text-left px-2 py-2 text-sm hover:bg-gray-200 text-red-500 z-100 cursor-pointer"
  //                 >
  //                   Delete
  //                 </button>
  //               </div>
  //             )}
  //           </div>
  //         </div>

  //         {isExpanded && hasChildren && renderTree(item.id, level + 1)}
  //       </div>
  //     );
  //   });
  // };

  const renderTree = (parentId = undefined, level = 0) => {
    const children = deletedItems.filter((item) =>
      parentId === undefined
        ? !deletedItems.some((i) => i.id === item.parentId)
        : item.parentId === parentId
    );

    return children.map((item) => {
      const hasChildren = deletedItems.some((i) => i.parentId === item.id);
      const isExpanded = expandedItems[item.id];
      const isDropdownOpen = dropdownOpen[item.id];
      const isFolder = item.type === "folder" || item.isFolder || hasChildren;

      return (
        <div key={item.id} style={{ marginLeft: level * 12 }} className="mb-1">
          <div
            className={`flex justify-between items-center py-1 px-1 rounded relative z-10 transition-all duration-200 ${
              isDropdownOpen ? "bg-gray-100" : ""
            }`}
          >
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedBinItems.includes(item.id)}
                onChange={() => toggleBinItemSelection(item.id)}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 text-blue-600 rounded mr-2"
              />

              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(item.id);
                  }}
                  className="text-gray-600 hover:text-gray-800 transition-all duration-200"
                >
                  {isExpanded ? (
                    <FiChevronDown className="w-4 h-4" />
                  ) : (
                    <FiChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
              <span
                className="flex items-center gap-2"
                style={{ paddingLeft: level * 12 }}
              >
                {isFolder ? (
                  <FiFolder className="w-4 h-4 text-yellow-500" />
                ) : (
                  // <FiFile className="w-4 h-4 text-blue-500" />
                  getFileIcon(item.name)
                )}
                {/* <span className="truncate w-32 text-sm">{item.name}</span> */}
                <span
                  className="truncate w-32 text-sm cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isFolder) openFile(item); // Only open if it's not a folder
                  }}
                >
                  {item.name}
                </span>
              </span>
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen((prev) => ({
                    ...Object.fromEntries(
                      Object.keys(prev).map((k) => [k, false])
                    ),
                    [item.id]: !prev[item.id],
                  }));
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <FiMoreVertical className="w-4 h-4" />
              </button>

              {isDropdownOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-[-20px] right-0 w-24 bg-white border border-gray-200 rounded shadow z-100"
                >
                  <button
                    onClick={() => restoreItem(item.id)}
                    className="block w-full h-[40%] text-left px-2 py-2 text-sm hover:bg-gray-200 text-green-600 z-100 cursor-pointer"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handleDeletePermanently(item.id)}
                    className="block w-full h-[40%] text-left px-2 py-2 text-sm hover:bg-gray-200 text-red-500 z-100 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {isExpanded && hasChildren && renderTree(item.id, level + 1)}
        </div>
      );
    });
  };
  return (
    <div className="p-2 shadow flex justify-between items-center">
      <div className="flex items-center gap-7">
        <h1 className="text-[25px] font-bold text-gray-600">Files</h1>
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Search files and folders"
            className="border border-gray-400 w-full text-gray-600 placeholder-gray-500 rounded pl-4 pr-8 py-1.5 text-sm focus:outline-none"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FiSearch className="w-4 h-4 absolute top-2.5 right-3 text-gray-500" />
        </div>
      </div>

      <div className="flex items-center space-x-5">
        <div className="relative">
          <button
            onClick={() => setShowBin((prev) => !prev)}
            className="text-gray-400 hover:text-gray-600 hover:cursor-pointer transition"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
          {showBin && (
            <div className="absolute right-10 top-14 w-[50vw] h-[50vh] bg-white shadow-xl border border-gray-300 rounded-lg z-50 p-4 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold text-gray-700">
                  Recycle Bin
                </h4>
                <button
                  onClick={() => setShowBin(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {deletedItems.length === 0 ? (
                <p className="text-sm text-gray-400 flex-1">
                  Recycle bin is empty.
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={
                        selectedBinItems.length === deletedItems.length &&
                        deletedItems.length > 0
                      }
                      onChange={toggleSelectAllBinItems}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-600">
                      {selectedBinItems.length === deletedItems.length &&
                      deletedItems.length > 0
                        ? "Unselect All"
                        : "Select All"}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 rounded text-sm relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {renderTree()}
                  </div>
                </>
              )}

              {/* <div className="mt-4 flex justify-end gap-4">
                <button
                  onClick={handleRestoreAll}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Restore All
                </button>
                <button
                  onClick={handleEmptyBin}
                  className="text-red-500 text-sm font-medium hover:underline"
                >
                  Empty Bin
                </button>
              </div> */}
              <div className="mt-4 flex justify-end gap-4">
                {selectedBinItems.length > 0 ? (
                  <>
                    <button
                      onClick={handleRestoreSelected}
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      Restore Selected
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      className="text-red-500 text-sm font-medium hover:underline"
                    >
                      Delete Selected
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleRestoreAll}
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      Restore All
                    </button>
                    <button
                      onClick={handleEmptyBin}
                      className="text-red-500 text-sm font-medium hover:underline"
                    >
                      Empty Bin
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <button className="text-gray-400 hover:text-gray-600 hover:cursor-pointer">
          <FiEye className="w-5 h-5" />
        </button>

        <div className="flex space-x-1">
          <button
            className={`p-1 rounded transition-all ${
              viewMode === "list"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-400 hover:bg-gray-100"
            }`}
            onClick={() => setViewMode("list")}
          >
            <BsListUl className="w-5 h-5" />
          </button>
          <button
            className={`p-1 rounded transition-all ${
              viewMode === "grid"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-400 hover:bg-gray-100"
            }`}
            onClick={() => setViewMode("grid")}
          >
            <BsGrid3X3Gap className="w-5 h-5" />
          </button>
        </div>

        <select
          className="border border-gray-400 text-gray-600 rounded text-sm py-1.5 pl-2 pr-3 focus:outline-none mr-5"
          onChange={(e) => setSortBy(e.target.value.toLowerCase())}
        >
          <option value="default">Sort by</option>
          <option value="name">Name</option>
          <option value="date">Date</option>
        </select>

        {isAuthenticated && user && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowProfile(!showProfile);
              }}
              className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 hover:ring-2 ring-blue-500"
            >
              <img
                src={user.picture}
                alt="user"
                className="w-full h-full object-cover"
              />
            </button>

            {showProfile && (
              <div
                className="absolute right-0 top-10 bg-white border rounded shadow-lg p-4 w-72 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-2 bg-purple-500 flex items-center justify-center text-white text-xl font-bold">
                    {user.name?.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-gray-700">{user.name}</h3>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                {additionalAccounts.length > 0 && (
                  <>
                    <hr className="my-3" />
                    <div className="text-xs text-gray-600 space-y-1 px-2">
                      {additionalAccounts
                        .filter((email) => email !== user.email)
                        .map((email, idx) => (
                          <p key={idx}>{email}</p>
                        ))}
                    </div>
                  </>
                )}

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const confirmLogout = window.confirm(
                        "Are you sure you want to sign out?"
                      );
                      if (confirmLogout) {
                        logout({ returnTo: window.location.origin });
                      }
                    }}
                    className="w-full text-sm py-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Sign out
                  </button>

                  {/* <button
                    onClick={handleAddAccount}
                    className="w-full text-sm py-1.5 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                  >
                    Add another account
                  </button> */}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
