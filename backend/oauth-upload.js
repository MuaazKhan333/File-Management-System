const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  "YOUR_CLIENT_ID", // Replace with your OAuth2 client ID
  "YOUR_CLIENT_SECRET", // Replace with your OAuth2 client secret
  "http://localhost:8000/auth/google/callback" // Redirect URI
);

// Generate authorization URL
const getAuthUrl = () => {
  const scopes = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
};

// Handle OAuth callback
const handleCallback = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens for later use
    fs.writeFileSync("./tokens.json", JSON.stringify(tokens));

    return tokens;
  } catch (error) {
    console.error("Error getting tokens:", error);
    throw error;
  }
};

// Upload file using OAuth2
const uploadToGoogleDriveOAuth = async (file) => {
  try {
    // Load saved tokens
    if (fs.existsSync("./tokens.json")) {
      const tokens = JSON.parse(fs.readFileSync("./tokens.json", "utf8"));
      oauth2Client.setCredentials(tokens);
    } else {
      throw new Error("No OAuth tokens found. Please authenticate first.");
    }

    const driveService = google.drive({ version: "v3", auth: oauth2Client });

    const fileMetadata = {
      name: file.originalname,
      parents: ["13alsJWxmYAYnz7SnTR0j8AldyCtTm74G"], // Your folder ID
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    // Upload file
    const uploadResponse = await driveService.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
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
    console.error("Error uploading file with OAuth:", error);
    throw error;
  }
};

module.exports = {
  getAuthUrl,
  handleCallback,
  uploadToGoogleDriveOAuth,
  oauth2Client,
};
