import React, { useContext, useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { FileContext } from "../context/FileContext";
import FileTree from "./FileTree";
import FolderSelectModal from "./FolderSelectModal";
import NotesEditor from "./NotesEditor";
import ApiFileImportModal from "./ApiFileImportModal";
import { useAuth0 } from "@auth0/auth0-react";

// const apiLinks = [
//   // Images (from Lorem Picsum)
//   "https://picsum.photos/2000/2000.jpg",
//   "https://picsum.photos/2000/2001.jpg",
//   // "https://docs.google.com/document/d/18E9gA9vKtMGvjjagmFH5L5JBAM3hNr4glJobYyYwL5M/edit?usp=sharing",
//   "https://docs.google.com/document/d/1we1BVvA9GVeNBTSJN7gfQdO_qtZ_hvyW/edit?usp=sharing&ouid=114196123407693222052&rtpof=true&sd=true",
//   "https://docs.google.com/spreadsheets/d/1YhaKETokFAiOx7pSZzTgMAEEH4rztzpl/edit?usp=sharing&ouid=114196123407693222052&rtpof=true&sd=true.xlsx",
//   "https://icseindia.org/document/sample.pdf",
//   "https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf",
//   "https://www.gutenberg.org/files/1342/1342-0.txt",
//   "https://www.gutenberg.org/files/84/84-0.txt",
//   "https://docs.google.com/spreadsheets/d/16ilcdtqnvl_kSd97XwJWuFnbn4PdI6fY/edit?usp=sharing&ouid=114196123407693222052&rtpof=true&sd=true.xlsx",
//   "https://docs.google.com/spreadsheets/d/1M6nSKzO2k1fXkh1t51ki5If5dJXlxSvO/edit?usp=sharing&ouid=114196123407693222052&rtpof=true&sd=true.xlsx",
// ];

const apiLinks = [
  // Images
  "https://picsum.photos/2000/2000.jpg",
  "https://picsum.photos/2000/2001.jpg",

  // ✅ Converted Google Doc (make sure sharing is set to "Anyone with link")
  "https://docs.google.com/document/d/1we1BVvA9GVeNBTSJN7gfQdO_qtZ_hvyW/export?format=docx",
  // "https://docs.google.com/document/d/1Nnb0yyT59YS49ZNswKKnh31-WnjtlFDv/export?format=docx",

  // ✅ Converted Google Sheets
  "https://docs.google.com/spreadsheets/d/1YhaKETokFAiOx7pSZzTgMAEEH4rztzpl/export?format=xlsx",
  "https://docs.google.com/spreadsheets/d/16ilcdtqnvl_kSd97XwJWuFnbn4PdI6fY/export?format=xlsx",
  "https://docs.google.com/spreadsheets/d/1M6nSKzO2k1fXkh1t51ki5If5dJXlxSvO/export?format=xlsx",

  // ✅ These are already correct
  "https://icseindia.org/document/sample.pdf",
  "https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf",
  "https://education.github.com/git-cheat-sheet-education.pdf",
  "https://www.gutenberg.org/files/1342/1342-0.txt",
  "https://www.gutenberg.org/files/84/84-0.txt",
];

const Sidebar = () => {
  const {
    files,
    currentFolder,
    setCurrentFolder,
    addFile,
    addFolder,
    getUserFiles,
  } = useContext(FileContext);

  const { user } = useAuth0();
  const [dropdown, setDropdown] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [inputType, setInputType] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [pickedFile, setPickedFile] = useState(null);
  const [selectFolderModal, setSelectFolderModal] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState([]);
  const [newFileId, setNewFileId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const refreshFiles = async () => {
      if (user?.email && !showEditor) {
        setIsRefreshing(true);
        try {
          await getUserFiles(user.email);
        } catch (error) {
          console.error("Failed to refresh files:", error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };
    refreshFiles();
  }, [user?.email, showEditor, getUserFiles]);

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    const name = inputValue.trim();

    if (inputType === "file") {
      const newFile = addFile(
        name,
        currentFolder?.id ?? null,
        "// New file",
        "text/plain",
        user
      );
      if (currentFolder?.id) {
        setExpandedFolders((prev) => [...prev, currentFolder.id]);
      }
      setNewFileId(newFile.id);
    } else {
      const newFolder = addFolder(name, currentFolder?.id ?? null);
      if (currentFolder?.id) {
        setExpandedFolders((prev) => [...prev, currentFolder.id]);
      }
      setNewFileId(newFolder.id);
    }

    setInputVisible(false);
    setInputValue("");
    setInputType(null);
    setDropdown(false);
  };

  // const handleImportFile = async () => {
  //   try {
  //     const [fileHandle] = await window.showOpenFilePicker({
  //       types: [
  //         {
  //           description: "Supported Files",
  //           accept: {
  //             "image/*": [".png", ".jpg", ".jpeg", ".gif"],
  //             "application/pdf": [".pdf"],
  //             "text/*": [".txt", ".js", ".json", ".html", ".css"],
  //           },
  //         },
  //       ],
  //     });

  //     const file = await fileHandle.getFile();
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setPickedFile({
  //         name: file.name,
  //         url: reader.result,
  //         fileType: file.type,
  //         size: file.size, // Add file size
  //       });
  //       setSelectFolderModal(true);
  //     };
  //     reader.readAsDataURL(file);
  //   } catch (err) {
  //     console.error("File import cancelled or failed", err);
  //   }
  // };

  // Add URL validation function

  const handleImportFile = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: "Supported Files",
            accept: {
              "image/*": [".png", ".jpg", ".jpeg", ".gif"],
              "application/pdf": [".pdf"],
              "text/*": [".txt", ".js", ".json", ".html", ".css"],
            },
          },
        ],
      });

      const file = await fileHandle.getFile();

      // 🟢 Pass the real File object directly
      setPickedFile(file); // This assumes you're using this in the modal
      setSelectFolderModal(true);
    } catch (err) {
      console.error("File import cancelled or failed", err);
    }
  };

  const validateFileUrl = async (url) => {
    try {
      // Skip validation for certain domains that are known to have CORS restrictions
      const skipValidationDomains = [
        "github.com",
        "education.github.com",
        "raw.githubusercontent.com",
        "gist.githubusercontent.com",
      ];

      const urlObj = new URL(url);
      const shouldSkipValidation = skipValidationDomains.some((domain) =>
        urlObj.hostname.includes(domain)
      );

      if (shouldSkipValidation) {
        console.log(
          "Skipping validation for CORS-restricted domain:",
          urlObj.hostname
        );
        return {
          accessible: true,
          contentType: null,
          contentLength: null,
          skipped: true,
        };
      }

      const response = await fetch(url, {
        method: "HEAD", // Just check headers, don't download content
        headers: {
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`URL not accessible: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      const contentLength = response.headers.get("content-length");

      console.log("URL validation successful:", {
        contentType,
        contentLength,
        status: response.status,
      });

      return {
        accessible: true,
        contentType,
        contentLength: contentLength ? parseInt(contentLength) : null,
      };
    } catch (error) {
      console.error("URL validation failed:", error);

      // For CORS errors, we'll still try to download the file
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("CORS")
      ) {
        console.log("CORS error detected, will try direct download");
        return {
          accessible: true, // Allow download attempt
          contentType: null,
          contentLength: null,
          corsError: true,
        };
      }

      return {
        accessible: false,
        error: error.message,
      };
    }
  };

  const handleImportFromApi = async (url) => {
    console.log("Fetching file from URL:", url);

    try {
      // First validate the URL
      console.log("Validating URL...");
      const validation = await validateFileUrl(url);

      if (!validation.accessible) {
        throw new Error(`URL validation failed: ${validation.error}`);
      }

      console.log("URL validation passed, proceeding with download...");

      // Check if this is a CORS-restricted domain
      const urlObj = new URL(url);
      const corsRestrictedDomains = [
        "github.com",
        "education.github.com",
        "raw.githubusercontent.com",
        "gist.githubusercontent.com",
      ];

      const isCorsRestricted = corsRestrictedDomains.some((domain) =>
        urlObj.hostname.includes(domain)
      );

      // Try direct fetch first (for same-origin or CORS-enabled URLs)
      let response;
      let useProxy = false;

      if (isCorsRestricted) {
        console.log("CORS-restricted domain detected, using proxy directly");
        useProxy = true;
      } else {
        try {
          response = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "*/*",
            },
          });

          if (!response.ok) {
            throw new Error(`Direct fetch failed: ${response.status}`);
          }

          console.log("Direct fetch successful");
        } catch (directError) {
          console.log(
            "Direct fetch failed, trying CORS proxy:",
            directError.message
          );
          useProxy = true;
        }
      }

      // Use CORS proxy if needed
      if (useProxy) {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        console.log("Using CORS proxy:", proxyUrl);
        response = await fetch(proxyUrl);

        if (!response.ok) {
          throw new Error(`Proxy fetch failed: ${response.status}`);
        }

        console.log("Proxy fetch successful");
      }

      console.log("Fetch response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);

      const blob = await response.blob();
      console.log("Blob type (MIME):", blob.type);
      console.log("Blob size:", blob.size);

      // Check if blob is empty or too small (indicating corruption)
      if (blob.size === 0) {
        throw new Error("Downloaded file is empty - possible corruption");
      }

      if (blob.size < 100 && !blob.type.includes("text")) {
        console.warn("File seems very small, might be corrupted");
      }

      let fileName = decodeURIComponent(url.split("/").pop().split("?")[0]);
      console.log("Initial filename from URL:", fileName);

      const contentDisposition = response.headers.get("content-disposition");
      console.log("Content-Disposition header:", contentDisposition);

      if (contentDisposition?.includes("filename=")) {
        const match = contentDisposition.match(
          /filename[^;=\n]*=(['"]?)([^'"\n]*)\1?/
        );
        if (match?.[2]) {
          fileName = match[2];
          console.log("Filename from headers:", fileName);
        }
      }

      const mime = blob.type;

      const extMap = {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          "docx",
        "application/msword": "doc",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          "xlsx",
        "application/vnd.ms-excel": "xls",
        "application/pdf": "pdf",
        "text/plain": "txt",
        "image/jpeg": "jpg",
        "image/png": "png",
        "video/mp4": "mp4",
      };

      let correctExt = extMap[mime];
      console.log("Resolved extension from MIME:", correctExt);

      // 👇 Check URL for hints if MIME is missing or generic
      if (!correctExt || mime === "application/octet-stream") {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes("document")) correctExt = "doc";
        if (lowerUrl.includes("spreadsheet")) correctExt = "xls";
        if (lowerUrl.includes(".pdf")) correctExt = "pdf";
        if (lowerUrl.includes(".doc")) correctExt = "doc";
        if (lowerUrl.includes(".docx")) correctExt = "docx";
        console.log("Fallback extension from URL:", correctExt);
      }

      // 👇 Ensure filename has correct extension
      if (correctExt) {
        if (!fileName.includes(".")) {
          fileName += `.${correctExt}`;
        } else {
          const currentExt = fileName.split(".").pop().toLowerCase();
          if (currentExt !== correctExt) {
            fileName = fileName.replace(/\.[^/.]+$/, `.${correctExt}`);
          }
        }
      }

      console.log("Final filename to download:", fileName);

      // ✅ Force file download with proper binary handling
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      // ✅ Save URL instead of converting to base64
      console.log("File successfully downloaded, saving URL to database");
      setPickedFile({
        name: fileName,
        url: url, // Save the original URL, not base64
        fileType: mime,
        content: null, // No base64 content
        isUrlBased: true, // Flag to indicate this is URL-based
        useProxy: useProxy, // Track if proxy was used
        size: blob.size, // Add file size
      });
      setShowApiModal(false);
      setSelectFolderModal(true);
    } catch (error) {
      console.error("Failed to download file:", error);
      alert(
        `Download failed: ${error.message}. Please try another file or check the URL.`
      );
    }
  };

  const handleFolderSelect = (folderId) => {
    if (!pickedFile || !user?.email) return;

    // Create file object with proper structure for URL-based files
    const fileData = {
      name: pickedFile.name,
      url: pickedFile.url,
      fileType: pickedFile.fileType,
      content: pickedFile.content, // Will be null for URL-based files
      isUrlBased: pickedFile.isUrlBased || false,
      uploadedToGoogleDrive: false, // Not uploaded to Google Drive yet
      size: pickedFile.size, // Add file size
    };

    const newFile = addFile(
      pickedFile.name,
      folderId,
      pickedFile.url,
      pickedFile.fileType,
      user,
      fileData // Pass the complete file data
    );

    if (folderId) {
      const expandPath = (id, acc = []) => {
        const folder = files.find((f) => f.id === id);
        if (folder?.parentId)
          return expandPath(folder.parentId, [folder.id, ...acc]);
        return [folder.id, ...acc];
      };
      setExpandedFolders(expandPath(folderId));
    }

    setNewFileId(newFile.id);
    setPickedFile(null);
    setSelectFolderModal(false);
  };

  const handleEditorClose = (savedFileId, parentFolderId) => {
    setShowEditor(false);
    if (savedFileId && parentFolderId) {
      setExpandedFolders((prev) => [...prev, parentFolderId]);
      setNewFileId(savedFileId);
    }
  };

  const folderList = files.filter((item) => item.type === "folder");

  return (
    <div className="w-64 bg-gray-100 p-4 h-screen overflow-auto border-r border-gray-200">
      <div className="relative mb-6">
        <button
          className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          onClick={() => setDropdown(!dropdown)}
        >
          <FiPlus className="w-4 h-4" />
          <span>Add New</span>
        </button>

        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center justify-center gap-2 w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Create Notes</span>
        </button>

        {dropdown && (
          <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg z-10 border border-gray-200">
            <div className="py-1">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  handleImportFile();
                  setDropdown(false);
                }}
              >
                Import File
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setShowApiModal(true);
                  setDropdown(false);
                }}
              >
                Import File from API
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
      </div>

      {inputVisible && (
        <div className="absolute w-60 z-20 top-20 left-4 right-4 bg-white rounded-md shadow-xl p-4 border border-gray-200">
          <div className="mb-2 text-sm text-gray-600">
            {inputType === "file" ? "File name:" : "Folder name:"}
          </div>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={inputType === "file" ? "e.g. app.js" : "e.g. MyFolder"}
            autoFocus
          />
          <div className="mt-3 flex justify-end space-x-2">
            <button
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              onClick={() => {
                setInputVisible(false);
                setInputValue("");
                setInputType(null);
              }}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              onClick={handleAdd}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {showEditor && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <NotesEditor
            user={user}
            onClose={handleEditorClose}
            setExpandedFolders={setExpandedFolders}
            setNewFileId={setNewFileId}
          />
        </div>
      )}

      <div className="overflow-y-auto h-[calc(100%-120px)]">
        <FileTree
          files={files}
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
          expandedFolders={expandedFolders}
          newFileId={newFileId}
        />
      </div>

      {selectFolderModal && (
        <FolderSelectModal
          folders={folderList}
          onSelect={handleFolderSelect}
          onCancel={() => {
            setPickedFile(null);
            setSelectFolderModal(false);
          }}
          user={user}
        />
      )}

      {/* {showApiModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Import File from API</h3>
            </div>
            <div className="p-4 overflow-y-auto">
              <div className="space-y-2">
                {apiLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => handleImportFromApi(link)}
                    className="w-full text-left px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                onClick={() => setShowApiModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )} */}
      {showApiModal && (
        <ApiFileImportModal
          apiLinks={apiLinks}
          onImport={handleImportFromApi}
          onClose={() => setShowApiModal(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
