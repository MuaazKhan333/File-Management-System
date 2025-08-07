import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { FileContext } from "../context/FileContext";
import { useAuth0 } from "@auth0/auth0-react";

const NotesEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { files, saveFile, updateFile, currentFolder } =
    useContext(FileContext);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [parentFolderId, setParentFolderId] = useState(null);
  const { user } = useAuth0();

  // useEffect(() => {
  //   console.log("Loading note with id:", id);
  //   const note = files.find((f) => f.id === id);
  //   if (note) {
  //     console.log("Found note:", note);
  //     const noteName = note.name.replace(/\.(html|txt)$/, "");
  //     setTitle(noteName);
  //     try {
  //       // Improved content decoding
  //       let contentToDecode = note.content;
  //       if (contentToDecode.startsWith("data:")) {
  //         contentToDecode = contentToDecode.split(",")[1];
  //       }
  //       const decodedContent = decodeURIComponent(
  //         escape(atob(contentToDecode))
  //       );
  //       console.log("Decoded content successfully");
  //       setContent(decodedContent);
  //     } catch (error) {
  //       console.error("Error decoding content:", error);
  //       setContent("");
  //     }
  //   } else {
  //     console.warn("Note not found with id:", id);
  //   }
  // }, [id, files]);

  useEffect(() => {
    console.log("Loading note with id:", id);
    const note = files.find((f) => f.id === id);
    if (note) {
      console.log("Found note:", note);
      const noteName = note.name.replace(/\.(html|txt)$/, "");
      setTitle(noteName);

      const loadContent = async () => {
        try {
          let contentToLoad = note.content || note.url;

          // if (!contentToLoad) {
          //   console.warn("No content found in note");
          //   setContent("");
          //   return;
          // }

          if (!contentToLoad) {
            console.warn("No content found in note");
            setContent("");
            return;
          }

          try {
            if (note.name.endsWith(".txt")) {
              if (contentToLoad.startsWith("blob:")) {
                const response = await fetch(contentToLoad);
                const text = await response.text();
                setContent(text);
              } else if (contentToLoad.startsWith("data:")) {
                const base64Data = contentToLoad.split(",")[1];
                const decoded = decodeURIComponent(escape(atob(base64Data)));
                setContent(decoded);
              } else if (/^[A-Za-z0-9+/=]+$/.test(contentToLoad)) {
                // raw base64 fallback
                const decoded = decodeURIComponent(escape(atob(contentToLoad)));
                setContent(decoded);
              } else {
                // 🔥 PLAIN TEXT fallback (not encoded!)
                setContent(contentToLoad);
              }
            } else {
              // Not a .txt file – fallback behavior (optional)
              setContent("");
            }
          } catch (err) {
            console.error("Failed to load note content:", err);
            setContent("");
          }

          if (contentToLoad.startsWith("blob:")) {
            // 🟢 Fetch Blob URL and read as text
            const response = await fetch(contentToLoad);
            const text = await response.text();
            setContent(text);
            console.log("Loaded content from Blob URL");
          } else if (contentToLoad.startsWith("data:")) {
            // 🟢 Base64 Data URL
            const base64Data = contentToLoad.split(",")[1];
            const decodedContent = decodeURIComponent(escape(atob(base64Data)));
            setContent(decodedContent);
            console.log("Decoded base64 content successfully");
          } else {
            // 🟢 Raw Base64 (without prefix)
            const decodedContent = decodeURIComponent(
              escape(atob(contentToLoad))
            );
            setContent(decodedContent);
            console.log("Decoded raw base64 content successfully");
          }
        } catch (error) {
          console.error("Error loading note content:", error);
          setContent("");
        }
      };

      loadContent();
    } else {
      console.warn("Note not found with id:", id);
    }
  }, [id, files]);

  const handleSave = async () => {
    console.log("Saving note...");
    if (!title.trim()) {
      alert("Please enter a title for your note");
      return;
    }

    try {
      console.log("Original content:", content);
      const encodedContent = btoa(unescape(encodeURIComponent(content)));
      console.log("Encoded content:", encodedContent);

      const updatedFile = {
        name: `${title.trim()}.txt`,
        content: encodedContent,
        fileType: "text/html",
        lastModified: new Date().toISOString(),
      };

      console.log("Updating file with:", updatedFile);
      await updateFile(id, updatedFile);

      console.log("File updated successfully");
      setIsDirty(false);

      // Small delay to ensure state updates propagate
      await new Promise((resolve) => setTimeout(resolve, 100));
      navigate(-1);
    } catch (error) {
      console.error("Failed to save note:", error);
      alert("Failed to save note. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow-lg h-screen flex flex-col">
      <input
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setIsDirty(true);
        }}
        placeholder="Note Title"
        className="w-full text-xl mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex-1 mb-4 border rounded overflow-hidden">
        <Editor
          apiKey="kujrjfqp1wzntpmlu5q9uow6kq75a8hantlra3ow00bbd8jq"
          value={content}
          onEditorChange={(newContent) => {
            setContent(newContent);
            setIsDirty(true);
          }}
          init={{
            height: "100%",
            menubar: false,
            plugins:
              "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table wordcount",
            toolbar:
              "undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code",
            content_style:
              "body { font-family:Inter,sans-serif; font-size:16px; margin: 10px; }",
          }}
        />
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={`flex-1 py-2 px-4 rounded ${
            isDirty
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isDirty ? "Save Changes" : "Saved"}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default NotesEditorPage;
