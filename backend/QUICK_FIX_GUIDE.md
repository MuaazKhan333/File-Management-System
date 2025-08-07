# Quick Fix Guide - Google Drive Upload Issue

## 🚨 Problem

Service account doesn't have storage quota for Google Drive uploads.

## ✅ Solution 1: OAuth2 Setup (Recommended)

### Step 1: Create OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `filetesting-468011`
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add redirect URI: `http://localhost:8000/auth/google/callback`
7. Click "Create"
8. **Download the JSON file** and save as `oauth-credentials.json` in the backend folder

### Step 2: Authenticate

1. Start your server: `npm start`
2. Visit: `http://localhost:8000/auth/google`
3. Complete the OAuth flow
4. Try uploading a file - it should work!

## ✅ Solution 2: Use Local Storage (Immediate Fix)

If OAuth2 setup is complex, use local storage instead:

```javascript
// Replace the upload function in server.js
const uploadToLocalStorage = async (file) => {
  const fileName = `${Date.now()}_${file.originalname}`;
  const filePath = `./uploads/${fileName}`;

  // Copy file to uploads folder
  fs.copyFileSync(file.path, filePath);

  // Return local URL
  return {
    webViewLink: `http://localhost:8000/uploads/${fileName}`,
    webContentLink: `http://localhost:8000/uploads/${fileName}`,
  };
};
```

## ✅ Solution 3: Use Cloudinary (Alternative Cloud Storage)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Install: `npm install cloudinary`
3. Configure in your code:

```javascript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "your_cloud_name",
  api_key: "your_api_key",
  api_secret: "your_api_secret",
});

const uploadToCloudinary = async (file) => {
  const result = await cloudinary.uploader.upload(file.path);
  return {
    webViewLink: result.secure_url,
    webContentLink: result.secure_url,
  };
};
```

## ✅ Solution 4: Use Firebase Storage

1. Install: `npm install firebase`
2. Set up Firebase project
3. Use Firebase Storage instead of Google Drive

## 🎯 Quick Test

After implementing any solution, test with:

```bash
curl -X POST -F "file=@test.txt" http://localhost:8000/upload-file-to-google-drive
```

## 📝 Current Status

Your server is configured to:

1. Try OAuth2 first (if credentials exist)
2. Fallback to service account (which fails due to quota)
3. Show detailed error messages

## 🚀 Next Steps

1. **Try OAuth2 setup** (follow Solution 1)
2. **If that fails**, implement local storage (Solution 2)
3. **For production**, consider Cloudinary or Firebase (Solutions 3-4)

The OAuth2 approach is the most reliable long-term solution for Google Drive integration.
