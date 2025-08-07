# Google Drive Upload Setup Guide

## Problem

You're getting the error: "Service Accounts do not have storage quota. Leverage shared drives, or use OAuth delegation instead."

## Solution 1: Use Shared Drives (Recommended)

### Step 1: Enable Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `filetesting-468011`
3. Go to "APIs & Services" > "Library"
4. Search for "Google Drive API" and enable it

### Step 2: Enable Shared Drive API

1. In the same library, search for "Shared Drive API" or "Drive API"
2. Make sure it's enabled

### Step 3: Update Service Account Permissions

1. Go to "APIs & Services" > "Credentials"
2. Find your service account: `test1-594@filetesting-468011.iam.gserviceaccount.com`
3. Click on it and go to "Permissions"
4. Add the following roles:
   - Drive File Stream
   - Drive Admin
   - Service Account Token Creator

### Step 4: Create a Shared Drive

1. Go to [Google Drive](https://drive.google.com)
2. Click "New" > "Shared drive"
3. Name it "File Upload Drive"
4. Add your service account email as a member with "Manager" role

### Step 5: Test the Upload

The code has been updated to automatically use shared drives. Try uploading a file again.

## Solution 2: Use OAuth2 (Alternative)

If shared drives don't work, use OAuth2 with user consent:

### Step 1: Create OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "OAuth 2.0 Client IDs"
4. Choose "Web application"
5. Add authorized redirect URIs: `http://localhost:8000/auth/google/callback`
6. Download the JSON file

### Step 2: Update OAuth Configuration

1. Open `backend/oauth-upload.js`
2. Replace `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with your actual values
3. Update the redirect URI if needed

### Step 3: Add OAuth Routes to server.js

Add these routes to your server.js:

```javascript
const {
  getAuthUrl,
  handleCallback,
  uploadToGoogleDriveOAuth,
} = require("./oauth-upload");

// OAuth routes
app.get("/auth/google", (req, res) => {
  const authUrl = getAuthUrl();
  res.redirect(authUrl);
});

app.get("/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    await handleCallback(code);
    res.send("Authentication successful! You can now upload files.");
  } catch (error) {
    res.status(500).send("Authentication failed: " + error.message);
  }
});

// Alternative upload route using OAuth
app.post("/upload-file-oauth", multer.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const publicFileData = await uploadToGoogleDriveOAuth(req.file);

    // Delete local file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting local file:", err);
    });

    res.status(200).json({ publicUrl: publicFileData.webViewLink });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).send("Internal Server Error");
  }
});
```

### Step 4: Authenticate

1. Start your server
2. Visit `http://localhost:8000/auth/google`
3. Complete the OAuth flow
4. Use the `/upload-file-oauth` endpoint instead of `/upload-file-to-google-drive`

## Troubleshooting

### If you still get quota errors:

1. Check if your Google Workspace account has shared drives enabled
2. Verify the service account has proper permissions
3. Try the OAuth2 approach instead

### If OAuth2 doesn't work:

1. Make sure redirect URIs match exactly
2. Check that the OAuth consent screen is configured
3. Verify the client ID and secret are correct

## Testing

After setup, test with a small file first:

```bash
curl -X POST -F "file=@test.txt" http://localhost:8000/upload-file-to-google-drive
```

The response should include a public URL to your uploaded file.
