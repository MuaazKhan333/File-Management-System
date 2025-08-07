import React, { createContext, useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { FileViewerModal } from "../components/FileViewerModal.jsx";
import { useAuth0 } from "@auth0/auth0-react";
import {
  initDB,
  getUserFiles,
  saveFile,
  saveFilesBulk,
  deleteFileById,
  // getAllFiles,
  getUserDeletedFiles,
  saveDeletedFilesBulk,
  deleteDeletedFileById,
  saveDeletedFile,
} from "../components/utils/db.js";
import { useNavigate } from "react-router-dom";

export const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const { user } = useAuth0();
  const [files, setFiles] = useState([]);
  const [folderTree, setFolderTree] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  // const [openedFile, setOpenedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("list");
  const [deletedItems, setDeletedItems] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState([]);
  const [newFileId, setNewFileId] = useState(null); // ✅ Track newly created file ID
  const [currentFileToView, setCurrentFileToView] = useState(null);

  // Load user data on mount or when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.email) return;

      try {
        const [storedFiles, storedDeleted] = await Promise.all([
          getUserFiles(user.email),
          getUserDeletedFiles(user.email),
        ]);
        setFiles(storedFiles || []);
        setDeletedItems(storedDeleted || []);
      } catch (err) {
        console.error("Failed to load from DB:", err);
      }
    };

    loadUserData();
  }, [user?.email]); // Reload when user changes

  // Save files when they change
  useEffect(() => {
    if (files.length > 0 && user?.email) {
      saveFilesBulk(user.email, files).catch((err) =>
        console.error("Failed to save files:", err)
      );
    }
  }, [files, user?.email]);

  // Save deleted items when they change
  useEffect(() => {
    if (deletedItems.length > 0 && user?.email) {
      saveDeletedFilesBulk(user.email, deletedItems).catch((err) =>
        console.error("Failed to save deleted items:", err)
      );
    }
  }, [deletedItems, user?.email]);

  // Build folder tree structure
  useEffect(() => {
    const buildTree = (flatFiles) => {
      const map = {};
      const roots = [];

      flatFiles.forEach((file) => {
        file.children = [];
        map[file.id] = file;
      });

      flatFiles.forEach((file) => {
        if (file.parentId && map[file.parentId]) {
          map[file.parentId].children.push(file);
        } else {
          roots.push(file);
        }
      });

      return roots;
    };

    setFolderTree(buildTree(files));
  }, [files]);

  const calculateFileSize = (base64String) => {
    if (!base64String || typeof base64String !== "string") return 0;

    const parts = base64String.split(",");
    if (parts.length !== 2) return 0;

    const base64 = parts[1];
    const padding = (base64.match(/=*$/) || [""])[0].length;

    try {
      return Math.round((base64.length * 3) / 4 - padding);
    } catch (err) {
      console.error("Failed to calculate file size:", err);
      return 0;
    }
  };

  // Add a new folder
  const addFolder = (name, parentId = null) => {
    const newFolder = {
      id: uuidv4(),
      name,
      type: "folder",
      parentId,
      createdAt: new Date().toISOString(),
      owner: user?.email, // Add owner field
    };
    setFiles((prev) => [...prev, newFolder]);
    return newFolder;
  };

  // const addFile = (
  //   name,
  //   parentId = null,
  //   content = "", // 🔄 Accept actual content
  //   fileType = "",
  //   user = null,
  //   fileData = null // Additional file data for URL-based files
  // ) => {
  //   let newFile;

  //   if (fileData && fileData.isUrlBased) {
  //     // Handle URL-based files (downloaded from API)
  //     newFile = {
  //       id: uuidv4(),
  //       name,
  //       type: "file",
  //       url: fileData.url, // Save the original URL
  //       content: null, // No base64 content for URL-based files
  //       fileType: fileData.fileType,
  //       parentId,
  //       size: fileData.size || 0, // Use actual file size from fileData
  //       createdAt: new Date().toISOString(),
  //       owner: user?.email ?? null,
  //       isUrlBased: true,
  //       uploadedToGoogleDrive: fileData.uploadedToGoogleDrive || false,
  //     };
  //   } else {
  //     // Handle regular files (text files with content)
  //     newFile = {
  //       id: uuidv4(),
  //       name,
  //       type: "file",
  //       url: "", // 🔄 Not needed for .txt — use `content` field
  //       content: name.endsWith(".txt") ? content : undefined,
  //       fileType,
  //       parentId,
  //       size: content.length,
  //       createdAt: new Date().toISOString(),
  //       owner: user?.email ?? null,
  //     };
  //   }

  //   setFiles((prev) => [...prev, newFile]);
  //   return newFile;
  // };

  // // Helper function to determine MIME type from extension

  //   setFiles((prev) => [...prev, newFile]);
  //   return newFile;
  // };

  const addFile = (
    name,
    parentId = null,
    content = "", // 🔄 Accept actual content
    fileType = "",
    user = null,
    fileData = null // Can be File object or a URL-based file
  ) => {
    let newFile;

    if (fileData && fileData.isUrlBased) {
      // ✅ Handle remote files (e.g. from Google Drive or server)
      newFile = {
        id: uuidv4(),
        name,
        type: "file",
        url: fileData.url,
        content: null,
        fileType: fileData.fileType,
        parentId,
        size: fileData.size || 0,
        createdAt: new Date().toISOString(),
        owner: user?.email ?? null,
        isUrlBased: true,
        uploadedToGoogleDrive: fileData.uploadedToGoogleDrive || false,
      };
    } else if (fileData instanceof File) {
      // ✅ Handle local file uploads (e.g. PDFs, images, etc.)
      const objectUrl = URL.createObjectURL(fileData);
      newFile = {
        id: uuidv4(),
        name: fileData.name,
        type: "file",
        url: objectUrl, // 🔥 Fix here: previewable blob URL
        content: null,
        fileType: fileType || fileData.type,
        parentId,
        size: fileData.size,
        createdAt: new Date().toISOString(),
        owner: user?.email ?? null,
        isLocal: true,
      };
    } else {
      // ✅ Handle text-based files (e.g. .txt)
      newFile = {
        id: uuidv4(),
        name,
        type: "file",
        url: "", // not needed for text
        content: name.endsWith(".txt") ? content : undefined,
        fileType,
        parentId,
        size: content.length,
        createdAt: new Date().toISOString(),
        owner: user?.email ?? null,
      };
    }

    setFiles((prev) => [...prev, newFile]);
    return newFile;
  };

  function getMimeTypeFromExtension(filename) {
    if (filename.endsWith(".pdf")) return "application/pdf";
    if (filename.endsWith(".doc")) return "application/msword";
    if (filename.endsWith(".docx"))
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (filename.endsWith(".xlsx"))
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (filename.endsWith(".pptx"))
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
      return "image/jpeg";
    if (filename.endsWith(".png")) return "image/png";
    return "application/octet-stream";
  }

  // const openFile = (file) => {
  //   try {
  //     if (!file) {
  //       throw new Error("File not found");
  //     }

  //     const fileUri = file.url || file.content;

  //     if (!fileUri) {
  //       throw new Error(
  //         "Could not open file. It may be corrupted or unsupported."
  //       );
  //     }

  //     // Detect if it's a Local Imported File (Blob URL or Data URL)
  //     if (fileUri.startsWith("blob:") || fileUri.startsWith("data:")) {
  //       const newTab = window.open(fileUri, "_blank");
  //       if (!newTab) {
  //         alert("Popup blocked! Please allow popups for this site.");
  //       }
  //       return; // Stop here — don't open modal
  //     }

  //     // For API or non-local files, open Viewer Modal
  //     setCurrentFileToView(file);
  //   } catch (error) {
  //     console.error("Error opening file:", error.message);
  //     alert(error.message);
  //   }
  // };

  // ✅ Add this import at top

  const navigate = useNavigate(); // ✅ Initialize inside your component (FileProvider)

  // const openFile = (file) => {
  //   try {
  //     if (!file) {
  //       throw new Error("File not found");
  //     }

  //     const fileUri = file.url || file.content;

  //     if (!fileUri) {
  //       throw new Error(
  //         "Could not open file. It may be corrupted or unsupported."
  //       );
  //     }

  //     const extension = file.name?.split(".").pop()?.toLowerCase();

  //     if (extension === "txt") {
  //       // ✅ Redirect to Notes Editor Page with file ID
  //       navigate(`/notes/${file.id}`);
  //       return;
  //     }

  //     const isLocalFile =
  //       fileUri.startsWith("blob:") ||
  //       fileUri.startsWith("data:") ||
  //       fileUri.startsWith("http://localhost") ||
  //       fileUri.startsWith("https://localhost");

  //     if (extension === "pdf") {
  //       // ✅ If it's local, open directly. Otherwise, use CORS proxy
  //       const finalUrl = isLocalFile
  //         ? fileUri
  //         : `https://corsproxy.io/?${encodeURIComponent(fileUri)}`;
  //       window.open(finalUrl, "_blank");
  //       return;
  //     }

  //     // ✅ Open all other file types in Viewer Modal
  //     setCurrentFileToView(file);
  //   } catch (error) {
  //     console.error("Error opening file:", error.message);
  //     alert(error.message);
  //   }
  // };

  // const openFile = (file) => {
  //   try {
  //     if (!file) {
  //       throw new Error("File not found");
  //     }

  //     const fileUri = file.url || file.content;

  //     if (!fileUri) {
  //       throw new Error(
  //         "Could not open file. It may be corrupted or unsupported."
  //       );
  //     }

  //     const extension = file.name?.split(".").pop()?.toLowerCase();

  //     if (extension === "txt") {
  //       // ✅ Redirect to Notes Editor Page with file ID
  //       navigate(`/notes/${file.id}`);
  //       return;
  //     }

  //     if (extension === "pdf") {
  //       // ✅ Use CORS proxy for PDF viewing
  //       const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(fileUri)}`;
  //       window.open(proxyUrl, "_blank");
  //       return;
  //     }

  //     // ✅ Open all other file types in Viewer Modal
  //     setCurrentFileToView(file);
  //   } catch (error) {
  //     console.error("Error opening file:", error.message);
  //     alert(error.message);
  //   }
  // };

  const openFile = (file) => {
    try {
      console.log("🟡 Attempting to open file:", file);

      if (!file) {
        throw new Error("❌ File not found");
      }

      const fileUri = file.url || file.content;

      console.log("📄 File URI resolved:", fileUri);

      if (!fileUri || typeof fileUri !== "string") {
        throw new Error(
          "❌ Could not open file. It may be corrupted, missing a URL, or unsupported."
        );
      }

      const extension = file.name?.split(".").pop()?.toLowerCase();
      console.log("🔍 File extension:", extension);

      if (extension === "txt") {
        console.log("📓 Opening text file in notes editor:", file.id);
        navigate(`/notes/${file.id}`);
        return;
      }

      const isLocalFile =
        fileUri.startsWith("blob:") ||
        fileUri.startsWith("data:") ||
        fileUri.startsWith("http://localhost") ||
        fileUri.startsWith("https://localhost");

      if (extension === "pdf") {
        const finalUrl = isLocalFile
          ? fileUri
          : `https://corsproxy.io/?${encodeURIComponent(fileUri)}`;
        console.log(`📄 Opening PDF:`, finalUrl);
        window.open(finalUrl, "_blank");
        return;
      }

      console.log("👁️ Opening file in viewer modal:", file.name);
      setCurrentFileToView(file);
    } catch (error) {
      console.error("❌ Error opening file:", error.message);
      alert(error.message);
    }
  };

  const permanentlyDeleteAll = async () => {
    for (const item of deletedItems) {
      await deleteDeletedFileById(user?.email, item.id);
    }
    setDeletedItems([]);
  };

  const updateFile = async (id, updates) => {
    console.log("Updating file in context:", id, updates);
    try {
      setFiles((prev) => {
        const updatedFiles = prev.map((file) =>
          file.id === id ? { ...file, ...updates } : file
        );
        console.log("Files after update:", updatedFiles);
        return updatedFiles;
      });

      if (user?.email) {
        console.log("Saving to database...");
        await saveFile(user.email, { id, ...updates });
        console.log("Saved to database successfully");
      }
    } catch (error) {
      console.error("Failed to update file:", error);
      throw error;
    }
  };
  const permanentlyDeleteItem = async (id) => {
    await deleteDeletedFileById(user?.email, id);
    const updatedDeletedItems = await getUserDeletedFiles(user?.email);
    setDeletedItems(updatedDeletedItems);
  };

  // Get full folder details by ID
  const getFullFolder = (id) => {
    const findFolder = (tree, targetId) => {
      for (const node of tree) {
        if (node.id === targetId) return node;
        if (node.children) {
          const found = findFolder(node.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    return findFolder(folderTree, id);
  };

  // Calculate item size (recursive for folders)
  const getItemSize = (item) => {
    if (item.type === "file") return item.size || 0;
    const children = files.filter((f) => f.parentId === item.id);
    return children.reduce((sum, child) => sum + getItemSize(child), 0);
  };

  // Rename an item
  const renameItem = (id, newName) => {
    setFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
    );
  };

  const deleteItem = async (item) => {
    try {
      const getAllDescendants = (parent) => {
        return files
          .filter((item) => item.parentId === parent.id)
          .flatMap((item) => [item, ...getAllDescendants(item)]);
      };

      const allToDelete = [item, ...getAllDescendants(item)];
      const idsToDelete = allToDelete.map((item) => item.id);

      // First delete from IndexedDB
      for (const id of idsToDelete) {
        await deleteFileById(user?.email, id);
      }

      const allDeleted = await getUserDeletedFiles(user?.email);
      const savePromises = [];

      const nameOccurrences = {}; // Track how many times we've seen each name

      for (const item of allToDelete) {
        const cleanName = item.name.replace(/\s*\([^)]+\)$/, "").trim();
        const isFolder = item.type === "folder";

        let deletedName = cleanName;

        // Check for conflict in the bin already
        const hasConflictInBin = allDeleted.some(
          (d) =>
            d.name.replace(/\s*\([^)]+\)$/, "").trim() === cleanName &&
            d.type === item.type
        );

        // Track internal name occurrences
        nameOccurrences[cleanName] = (nameOccurrences[cleanName] || 0) + 1;

        // Only attach suffix to first duplicate or if conflict in bin
        if (
          isFolder &&
          (nameOccurrences[cleanName] === 2 || hasConflictInBin)
        ) {
          const shortId = item.id.slice(-4);
          deletedName = `${cleanName} (${shortId})`;
        }

        savePromises.push(
          saveDeletedFile(user?.email, {
            ...item,
            name: deletedName,
            originalName: cleanName,
            owner: user?.email,
          })
        );
      }

      await Promise.all(savePromises);

      if (currentFolder && idsToDelete.includes(currentFolder?.id)) {
        setCurrentFolder(null);
      }

      setFiles((prev) => prev.filter((item) => !idsToDelete.includes(item.id)));

      const updatedDeleted = await getUserDeletedFiles(user?.email);
      setDeletedItems(updatedDeleted);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const restoreItem = async (id) => {
    const restoredIds = new Set(); // Track restored items to avoid duplicates

    const restoreSingleItem = async (itemId) => {
      const itemToRestore = deletedItems.find((item) => item.id === itemId);
      if (!itemToRestore) return;

      const activeSameName = files.find(
        (f) =>
          f.name === itemToRestore.name &&
          f.type === itemToRestore.type &&
          f.id !== itemToRestore.id
      );

      let finalId = itemToRestore.id;
      let finalName = itemToRestore.name;

      // Resolve name conflicts with active files
      if (activeSameName) {
        const suffix = Date.now().toString().slice(-4);
        finalId = `${itemToRestore.id}_${suffix}`;
        finalName = `${itemToRestore.name} (${suffix})`;
      } else {
        // Clean any "(xxxx)" suffix if no conflict
        finalName = itemToRestore.name.replace(/\s*\([^)]+\)$/, "").trim();
      }

      // Check if parent is already active; if not, move to root (parentId: null)
      const parentExists = files.find((f) => f.id === itemToRestore.parentId);
      const parentRestored = restoredIds.has(itemToRestore.parentId);
      const resolvedParentId =
        parentExists || parentRestored ? itemToRestore.parentId : null;

      await saveFile(user?.email, {
        ...itemToRestore,
        id: finalId,
        name: finalName,
        isDeleted: false,
        parentId: resolvedParentId, // Move to root if parent is not restored
      });

      restoredIds.add(finalId);

      // Delete from Recycle Bin
      await deleteDeletedFileById(user?.email, itemToRestore.id);
    };

    const item = deletedItems.find((item) => item.id === id);
    if (!item) return;

    if (item.type === "folder") {
      // Restore Folder + All Children
      const getAllDescendants = (parentId) => {
        return deletedItems
          .filter((i) => i.parentId === parentId)
          .flatMap((child) => [child, ...getAllDescendants(child.id)]);
      };

      const descendants = getAllDescendants(item.id);

      await restoreSingleItem(item.id); // Restore the parent folder

      // Restore its children after parent
      for (const child of descendants) {
        await restoreSingleItem(child.id);
      }
    } else {
      // Restore Only The File
      await restoreSingleItem(item.id);
    }

    // Refresh State
    const updatedDeletedItems = await getUserDeletedFiles(user?.email);
    setDeletedItems(updatedDeletedItems);

    const updatedFiles = await getUserFiles(user?.email);
    setFiles(updatedFiles);
  };

  const getSortedFiles = (filesToSort) => {
    const filtered = searchQuery
      ? filesToSort.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : filesToSort;

    switch (sortBy) {
      case "name":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case "date":
        return [...filtered].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "size":
        return [...filtered].sort((a, b) => getItemSize(b) - getItemSize(a));
      default:
        return filtered;
    }
  };

  // Helper to get depth in hierarchy
  const getDepth = (item, allItems) => {
    let depth = 0;
    let current = item;
    while (current?.parentId) {
      current = allItems.find((f) => f.id === current.parentId);
      if (!current) break;
      depth++;
    }
    return depth;
  };

  const handleRestoreAll = async () => {
    const existingNames = new Set(files.map((f) => f.name)); // 🧠 track names

    const rootItems = deletedItems.filter(
      (item) => !deletedItems.some((i) => i.id === item.parentId)
    );

    for (const rootItem of rootItems) {
      await restoreItem(rootItem.id, existingNames); // 🛠 pass down name tracking
    }

    const updatedDeletedItems = await getUserDeletedFiles(user?.email);
    setDeletedItems(updatedDeletedItems);

    const updatedFiles = await getUserFiles(user?.email);
    setFiles(updatedFiles);
  };

  return (
    <FileContext.Provider
      value={{
        files: getSortedFiles(files),
        folderTree,
        setFiles,
        currentFolder,
        setCurrentFolder,
        saveFile,
        addFile,
        addFolder,
        openFile,
        // openedFile,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        expandedFolders,
        setExpandedFolders,
        newFileId, // ✅ provided to consumers
        setNewFileId,
        viewMode,
        setViewMode,
        renameItem,
        deleteItem,
        restoreItem,
        getFullFolder,
        getItemSize,
        deletedItems,
        setDeletedItems,
        handleRestoreAll,
        permanentlyDeleteItem,
        permanentlyDeleteAll,
        getUserFiles,
        updateFile,
      }}
    >
      {children}
      {currentFileToView && (
        <FileViewerModal
          file={currentFileToView}
          onClose={() => setCurrentFileToView(null)}
        />
      )}
    </FileContext.Provider>
  );
};
