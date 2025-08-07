import React, { useState, useContext, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { FileContext } from "../context/FileContext";

const NotesEditor = ({
  user,
  onClose,
  setExpandedFolders,
  updateFile,
  setNewFileId,
}) => {
  const {
    addFile,
    files = [],
    getUserFiles,
    setFiles,
  } = useContext(FileContext);

  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("Untitled Note");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [expandedIds, setExpandedIds] = useState([]);

  useEffect(() => {
    if (!user) {
      console.warn("🚨 user is NULL or undefined in NotesEditor");
    } else {
      console.log("👤 Current user in NotesEditor:", user);
    }
  }, [user]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const renderFolderTree = (parentId) => {
    const children = files.filter(
      (item) =>
        item.type === "folder" &&
        item.parentId === (parentId === "root" ? null : parentId)
    );

    return children.map((folder) => {
      const isExpanded = expandedIds.includes(folder.id);
      const isSelected = selectedFolderId === folder.id;

      return (
        <div key={folder.id} className="ml-4">
          <div
            className={`flex items-center gap-2 cursor-pointer py-1 px-2 rounded ${
              isSelected ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
            onClick={() => {
              toggleExpand(folder.id);
              setSelectedFolderId(folder.id);
            }}
          >
            <span>{isExpanded ? <FiChevronDown /> : <FiChevronRight />}</span>
            <span className="ml-1">{folder.name}</span>
          </div>

          {isExpanded && renderFolderTree(folder.id)}
        </div>
      );
    });
  };

  const handleConfirmSave = async () => {
    try {
      console.log("➡️ Saving note...");

      if (!user || !user.email) {
        throw new Error(
          "❌ Cannot save note: user or user.email is undefined."
        );
      }

      const encodedHtml = btoa(unescape(encodeURIComponent(noteContent)));
      const folderId = selectedFolderId || null;

      const noteFile = await addFile(
        `${noteTitle}.txt`,
        folderId,
        encodedHtml,
        "text/html",
        user
      );

      console.log("✅ Note file created:", noteFile);

      if (folderId) {
        const expandPath = (id, acc = []) => {
          const folder = files.find((f) => f.id === id);
          if (folder?.parentId) {
            return expandPath(folder.parentId, [folder.id, ...acc]);
          }
          return [folder.id, ...acc];
        };

        const newExpanded = expandPath(folderId);
        setExpandedFolders(newExpanded);
        console.log("📂 Expanded folders set to:", newExpanded);
      }

      setNewFileId(noteFile.id);
      console.log("📌 Highlighting new file:", noteFile.id);

      setTimeout(async () => {
        console.log("🔄 Fetching updated files from backend...");
        const updatedFiles = await getUserFiles(user.email);
        console.log("✅ Updated files fetched:", updatedFiles);
        setFiles(updatedFiles);

        setSelectedFolderId((prev) => {
          console.log("📁 Reselecting folder:", prev);
          return prev;
        });

        setNoteContent("");
        onClose();
        console.log("✅ Save complete and editor closed.");
      }, 100);
    } catch (error) {
      console.error("❌ Failed to save note:", error);
      alert("Failed to save note. Please try again.\n\n" + error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow-lg">
      <input
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
        placeholder="Note Title"
        className="w-full text-xl mb-4 px-3 py-2 border rounded"
      />

      <Editor
        apiKey="kujrjfqp1wzntpmlu5q9uow6kq75a8hantlra3ow00bbd8jq"
        value={noteContent}
        onEditorChange={(content) => setNoteContent(content)}
        init={{
          height: 400,
          menubar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "wordcount",
          ],
          toolbar:
            "undo redo | formatselect | bold italic underline | fontsizeselect | " +
            "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
            "link table code fullscreen",
        }}
      />

      <div className="mt-6">
        <label className="block mb-2 font-semibold">Choose Folder:</label>
        <div className="border rounded p-3 max-h-64 overflow-auto bg-gray-50">
          {renderFolderTree("root")}
        </div>
      </div>

      <button
        onClick={handleConfirmSave}
        className="mt-6 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Confirm &amp; Save
      </button>

      <button
        onClick={onClose}
        className="mt-3 w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
      >
        Cancel
      </button>
    </div>
  );
};

export default NotesEditor;
