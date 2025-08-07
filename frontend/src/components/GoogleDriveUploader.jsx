import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";

const CLIENT_ID =
  "664487334783-540jenhl9lp3th467abfgqf8i99uot8l.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

const GoogleDriveUploader = ({ file, onClose }) => {
  useEffect(() => {
    const initClient = () => {
      gapi.client
        .init({
          clientId: CLIENT_ID,
          scope: SCOPES,
        })
        .then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          if (!authInstance.isSignedIn.get()) {
            authInstance.signIn();
          }
        });
    };
    gapi.load("client:auth2", initClient);
  }, []);

  const uploadFileToDrive = async () => {
    const accessToken = gapi.auth.getToken().access_token;

    const metadata = {
      name: file.name,
      mimeType: file.type,
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", file.content); // Ensure file.content is a Blob/File object

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
      {
        method: "POST",
        headers: new Headers({ Authorization: "Bearer " + accessToken }),
        body: form,
      }
    );

    const data = await response.json();
    alert("File Uploaded! File ID: " + data.id);
    onClose();
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">
        Upload "{file.name}" to Google Drive?
      </h2>
      <button
        onClick={uploadFileToDrive}
        className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
      >
        Upload
      </button>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-gray-300 text-black rounded"
      >
        Cancel
      </button>
    </div>
  );
};

export default GoogleDriveUploader;
