import { google } from "googleapis";
import fs from "fs";

// Service Account with Domain-Wide Delegation
const authenticateServiceAccount = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./apikey.json",
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.appdata",
    ],
    subject: "your-email@gmail.com", // Replace with your Gmail address
  });
  return auth;
};

// Upload to Google Drive using service account
const uploadToGoogleDrive = async (file) => {
  try {
    const auth = authenticateServiceAccount();
    const driveService = google.drive({ version: "v3", auth });

    // Create a folder in your Drive if it doesn't exist
    const folderName = "FileUploadApp";
    let folderId = null;

    // Search for existing folder
    const folderResponse = await driveService.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });

    if (folderResponse.data.files.length > 0) {
      folderId = folderResponse.data.files[0].id;
    } else {
      // Create new folder
      const folderMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      };

      const createFolderResponse = await driveService.files.create({
        requestBody: folderMetadata,
        fields: "id",
      });

      folderId = createFolderResponse.data.id;
      console.log("Created folder:", folderName, "with ID:", folderId);
    }

    // Upload file to the folder
    const fileMetadata = {
      name: file.originalname,
      parents: [folderId],
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    const uploadResponse = await driveService.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink",
    });

    const fileId = uploadResponse.data.id;

    // Make file public
    await driveService.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Get shareable link
    const result = await driveService.files.get({
      fileId,
      fields: "webViewLink, webContentLink",
    });

    return result.data;
  } catch (error) {
    console.error("Error uploading to Google Drive:", error);
    throw error;
  }
};

export { uploadToGoogleDrive };
