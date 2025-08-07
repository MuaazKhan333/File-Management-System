// import express from "express";
// import Multer from "multer";
// import cors from "cors";
// import { google } from "googleapis";
// import fs from "fs";
// import { dirname } from "path";
// import { fileURLToPath } from "url";

// // Fix __dirname for ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const app = express();
// app.use(cors());

// // 🔧 Create audio-files folder if it doesn't exist
// const uploadPath = `${__dirname}/audio-files`;
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// // ✅ Multer setup
// const multer = Multer({
//   storage: Multer.diskStorage({
//     destination: function (req, file, callback) {
//       callback(null, uploadPath);
//     },
//     filename: function (req, file, callback) {
//       callback(
//         null,
//         file.fieldname + "_" + Date.now() + "_" + file.originalname
//       );
//     },
//   }),
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
// });

// // ✅ Google Drive Auth - OAuth2 Setup
// let oauth2Client;

// // Load OAuth credentials if available
// if (fs.existsSync("./oauth-credentials.json")) {
//   const credentials = JSON.parse(
//     fs.readFileSync("./oauth-credentials.json", "utf8")
//   );
//   oauth2Client = new google.auth.OAuth2(
//     credentials.web.client_id,
//     credentials.web.client_secret,
//     "http://localhost:8000/auth/google/callback"
//   );
//   console.log("✅ OAuth2 client configured with credentials");
// } else {
//   console.log(
//     "⚠️ OAuth credentials not found. Run: node oauth-setup.js for instructions"
//   );
//   oauth2Client = new google.auth.OAuth2(
//     "placeholder-client-id",
//     "placeholder-client-secret",
//     "http://localhost:8000/auth/google/callback"
//   );
// }

// // Service account with domain-wide delegation
// const authenticateGoogle = () => {
//   const auth = new google.auth.GoogleAuth({
//     keyFile: `./apikey.json`,
//     scopes: [
//       "https://www.googleapis.com/auth/drive",
//       "https://www.googleapis.com/auth/drive.file",
//       "https://www.googleapis.com/auth/drive.appdata",
//     ],
//     // Add your Gmail address here for domain-wide delegation
//     subject: "your-email@gmail.com", // Replace with your actual Gmail address
//   });
//   return auth;
// };

// // ✅ Upload to Local Storage (immediate fix)
// const uploadToLocalStorage = async (file) => {
//   try {
//     const fileName = `${Date.now()}_${file.originalname}`;
//     const filePath = `./uploads/${fileName}`;

//     // Ensure uploads directory exists
//     if (!fs.existsSync("./uploads")) {
//       fs.mkdirSync("./uploads", { recursive: true });
//     }

//     // Copy file to uploads folder
//     fs.copyFileSync(file.path, filePath);

//     console.log("✅ File uploaded to local storage:", fileName);

//     // Return local URL
//     return {
//       webViewLink: `http://localhost:8000/uploads/${fileName}`,
//       webContentLink: `http://localhost:8000/uploads/${fileName}`,
//     };
//   } catch (error) {
//     console.error("Error uploading to local storage:", error);
//     throw error;
//   }
// };

// // ✅ Upload to Google Drive (fallback)
// const uploadToGoogleDrive = async (file, auth) => {
//   const driveService = google.drive({ version: "v3", auth });

//   try {
//     // Use app data folder which doesn't count against storage quota
//     const fileMetadata = {
//       name: file.originalname,
//       parents: ["appDataFolder"], // Special folder for app data
//     };

//     const media = {
//       mimeType: file.mimetype,
//       body: fs.createReadStream(file.path),
//     };

//     // Upload file to app data folder
//     const uploadResponse = await driveService.files.create({
//       requestBody: fileMetadata,
//       media: media,
//       fields: "id",
//     });

//     const fileId = uploadResponse.data.id;

//     // Make file public
//     await driveService.permissions.create({
//       fileId,
//       requestBody: {
//         role: "reader",
//         type: "anyone",
//       },
//     });

//     // Get shareable link
//     const result = await driveService.files.get({
//       fileId,
//       fields: "webViewLink, webContentLink",
//     });

//     return result.data;
//   } catch (error) {
//     console.error("Error uploading file:", error);

//     // Fallback: Try uploading to a specific folder if app data fails
//     try {
//       console.log("Trying fallback upload to specific folder...");

//       const fileMetadata = {
//         name: file.originalname,
//         parents: ["13alsJWxmYAYnz7SnTR0j8AldyCtTm74G"], // Your original folder ID
//       };

//       const media = {
//         mimeType: file.mimetype,
//         body: fs.createReadStream(file.path),
//       };

//       const uploadResponse = await driveService.files.create({
//         requestBody: fileMetadata,
//         media: media,
//         fields: "id",
//       });

//       const fileId = uploadResponse.data.id;

//       await driveService.permissions.create({
//         fileId,
//         requestBody: {
//           role: "reader",
//           type: "anyone",
//         },
//       });

//       const result = await driveService.files.get({
//         fileId,
//         fields: "webViewLink, webContentLink",
//       });

//       return result.data;
//     } catch (fallbackError) {
//       console.error("Fallback upload also failed:", fallbackError);
//       throw fallbackError;
//     }
//   }
// };

// // ✅ OAuth2 Routes
// app.get("/auth/google", (req, res) => {
//   const scopes = [
//     "https://www.googleapis.com/auth/drive.file",
//     "https://www.googleapis.com/auth/drive",
//   ];

//   const authUrl = oauth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: scopes,
//     prompt: "consent",
//   });

//   res.redirect(authUrl);
// });

// app.get("/auth/google/callback", async (req, res) => {
//   try {
//     const { code } = req.query;
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);

//     // Save tokens for later use
//     fs.writeFileSync("./tokens.json", JSON.stringify(tokens));

//     res.send(
//       "Authentication successful! You can now upload files using the OAuth endpoint."
//     );
//   } catch (error) {
//     console.error("Error getting tokens:", error);
//     res.status(500).send("Authentication failed: " + error.message);
//   }
// });

// // ✅ Serve uploaded files
// app.use("/uploads", express.static("uploads"));

// // ✅ Upload route with multiple fallbacks
// app.post(
//   "/upload-file-to-google-drive",
//   multer.single("file"),
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).send("No file uploaded.");
//       }

//       let publicFileData;

//       // Try OAuth2 first
//       try {
//         if (
//           fs.existsSync("./tokens.json") &&
//           fs.existsSync("./oauth-credentials.json")
//         ) {
//           const tokens = JSON.parse(fs.readFileSync("./tokens.json", "utf8"));
//           oauth2Client.setCredentials(tokens);

//           const driveService = google.drive({
//             version: "v3",
//             auth: oauth2Client,
//           });

//           const fileMetadata = {
//             name: req.file.originalname,
//             parents: ["13alsJWxmYAYnz7SnTR0j8AldyCtTm74G"],
//           };

//           const media = {
//             mimeType: req.file.mimetype,
//             body: fs.createReadStream(req.file.path),
//           };

//           const uploadResponse = await driveService.files.create({
//             requestBody: fileMetadata,
//             media: media,
//             fields: "id",
//           });

//           const fileId = uploadResponse.data.id;

//           await driveService.permissions.create({
//             fileId,
//             requestBody: {
//               role: "reader",
//               type: "anyone",
//             },
//           });

//           const result = await driveService.files.get({
//             fileId,
//             fields: "webViewLink, webContentLink",
//           });

//           publicFileData = result.data;
//           console.log("✅ Upload successful using OAuth2");
//         } else {
//           throw new Error("OAuth2 not configured");
//         }
//       } catch (oauthError) {
//         console.log(
//           "OAuth2 failed, trying service account...",
//           oauthError.message
//         );

//         // Try service account
//         try {
//           const auth = authenticateGoogle();
//           publicFileData = await uploadToGoogleDrive(req.file, auth);
//           console.log("✅ Upload successful using service account");
//         } catch (serviceAccountError) {
//           console.log(
//             "Service account failed, using local storage...",
//             serviceAccountError.message
//           );

//           // Fallback to local storage
//           publicFileData = await uploadToLocalStorage(req.file);
//           console.log("✅ Upload successful using local storage");
//         }
//       }

//       // Optional: delete temporary file
//       fs.unlink(req.file.path, (err) => {
//         if (err) console.error("Error deleting temporary file:", err);
//       });

//       res.status(200).json({ publicUrl: publicFileData.webViewLink });
//     } catch (err) {
//       console.error("Error uploading file:", err);
//       res.status(500).send("Internal Server Error");
//     }
//   }
// );

// // ✅ Start server
// app.listen(8000, () => {
//   console.log("Server running on http://localhost:8000");
// });

import express from "express";
import Multer from "multer";
import cors from "cors";
import { google } from "googleapis";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());

// 🔧 Create audio-files folder if it doesn't exist
const uploadPath = `${__dirname}/audio-files`;
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Multer setup
const multer = Multer({
  storage: Multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, uploadPath);
    },
    filename: function (req, file, callback) {
      callback(
        null,
        file.fieldname + "_" + Date.now() + "_" + file.originalname
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// ✅ Google Drive Auth - OAuth2 Setup
let oauth2Client;

// Load OAuth credentials if available
if (fs.existsSync("./oauth-credentials.json")) {
  const credentials = JSON.parse(
    fs.readFileSync("./oauth-credentials.json", "utf8")
  );
  oauth2Client = new google.auth.OAuth2(
    credentials.web.client_id,
    credentials.web.client_secret,
    "http://localhost:8000/auth/google/callback"
  );
  console.log("✅ OAuth2 client configured with credentials");
} else {
  console.log(
    "⚠️ OAuth credentials not found. Run: node oauth-setup.js for instructions"
  );
  oauth2Client = new google.auth.OAuth2(
    "placeholder-client-id",
    "placeholder-client-secret",
    "http://localhost:8000/auth/google/callback"
  );
}

// Service account with domain-wide delegation
const authenticateGoogle = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: `./apikey.json`,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.appdata",
    ],
    // Add your Gmail address here for domain-wide delegation
    subject: "your-email@gmail.com", // Replace with your actual Gmail address
  });
  return auth;
};

// ✅ Upload to Local Storage (immediate fix)
const uploadToLocalStorage = async (file) => {
  try {
    const fileName = `${Date.now()}_${file.originalname}`;
    const filePath = `./uploads/${fileName}`;

    // Ensure uploads directory exists
    if (!fs.existsSync("./uploads")) {
      fs.mkdirSync("./uploads", { recursive: true });
    }

    // Copy file to uploads folder
    fs.copyFileSync(file.path, filePath);

    console.log("✅ File uploaded to local storage:", fileName);

    // Return local URL
    return {
      webViewLink: `http://localhost:8000/uploads/${fileName}`,
      webContentLink: `http://localhost:8000/uploads/${fileName}`,
    };
  } catch (error) {
    console.error("Error uploading to local storage:", error);
    throw error;
  }
};

// ✅ Upload to Google Drive (fallback)
const uploadToGoogleDrive = async (file, auth) => {
  const driveService = google.drive({ version: "v3", auth });

  try {
    // Use app data folder which doesn't count against storage quota
    const fileMetadata = {
      name: file.originalname,
      parents: ["appDataFolder"], // Special folder for app data
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    // Upload file to app data folder
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
    console.error("Error uploading file:", error);

    // Fallback: Try uploading to a specific folder if app data fails
    try {
      console.log("Trying fallback upload to specific folder...");

      const fileMetadata = {
        name: file.originalname,
        parents: ["13alsJWxmYAYnz7SnTR0j8AldyCtTm74G"], // Your original folder ID
      };

      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      };

      const uploadResponse = await driveService.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
      });

      const fileId = uploadResponse.data.id;

      await driveService.permissions.create({
        fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      const result = await driveService.files.get({
        fileId,
        fields: "webViewLink, webContentLink",
      });

      return result.data;
    } catch (fallbackError) {
      console.error("Fallback upload also failed:", fallbackError);
      throw fallbackError;
    }
  }
};

// ✅ OAuth2 Routes
app.get("/auth/google", (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive",
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });

  res.redirect(authUrl);
});

app.get("/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens for later use
    fs.writeFileSync("./tokens.json", JSON.stringify(tokens));

    res.send(
      "Authentication successful! You can now upload files using the OAuth endpoint."
    );
  } catch (error) {
    console.error("Error getting tokens:", error);
    res.status(500).send("Authentication failed: " + error.message);
  }
});

// ✅ Serve uploaded files
app.use("/uploads", express.static("uploads"));

const createDriveFolder = async (auth, folderName) => {
  const drive = google.drive({ version: "v3", auth });
  const folderMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: "id",
  });

  return folder.data.id;
};

const shareDriveFolder = async (auth, folderId, email) => {
  const drive = google.drive({ version: "v3", auth });

  await drive.permissions.create({
    fileId: folderId,
    requestBody: {
      type: "user",
      role: "writer",
      emailAddress: email,
    },
    fields: "id",
  });
};

// const uploadFileToFolder = async (auth, file, folderId) => {
//   const drive = google.drive({ version: "v3", auth });

//   const fileMetadata = {
//     name: file.originalname,
//     parents: [folderId],
//   };

//   const media = {
//     mimeType: file.mimetype,
//     body: fs.createReadStream(file.path),
//   };

//   const uploadRes = await drive.files.create({
//     requestBody: fileMetadata,
//     media,
//     fields: "id, webViewLink, webContentLink",
//   });

//   return uploadRes.data;
// };

// ✅ Upload route with multiple fallbacks
// app.post(
//   "/upload-file-to-google-drive",
//   multer.single("file"),
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).send("No file uploaded.");
//       }

//       let publicFileData;

//       // Try OAuth2 first
//       try {
//         if (
//           fs.existsSync("./tokens.json") &&
//           fs.existsSync("./oauth-credentials.json")
//         ) {
//           const tokens = JSON.parse(fs.readFileSync("./tokens.json", "utf8"));
//           oauth2Client.setCredentials(tokens);

//           const driveService = google.drive({
//             version: "v3",
//             auth: oauth2Client,
//           });

//           const fileMetadata = {
//             name: req.file.originalname,
//             parents: ["13alsJWxmYAYnz7SnTR0j8AldyCtTm74G"],
//           };

//           const media = {
//             mimeType: req.file.mimetype,
//             body: fs.createReadStream(req.file.path),
//           };

//           const uploadResponse = await driveService.files.create({
//             requestBody: fileMetadata,
//             media: media,
//             fields: "id",
//           });

//           const fileId = uploadResponse.data.id;

//           await driveService.permissions.create({
//             fileId,
//             requestBody: {
//               role: "reader",
//               type: "anyone",
//             },
//           });

//           const result = await driveService.files.get({
//             fileId,
//             fields: "webViewLink, webContentLink",
//           });

//           publicFileData = result.data;
//           console.log("✅ Upload successful using OAuth2");
//         } else {
//           throw new Error("OAuth2 not configured");
//         }
//       } catch (oauthError) {
//         console.log(
//           "OAuth2 failed, trying service account...",
//           oauthError.message
//         );

//         // Try service account
//         try {
//           const auth = authenticateGoogle();
//           publicFileData = await uploadToGoogleDrive(req.file, auth);
//           console.log("✅ Upload successful using service account");
//         } catch (serviceAccountError) {
//           console.log(
//             "Service account failed, using local storage...",
//             serviceAccountError.message
//           );

//           // Fallback to local storage
//           publicFileData = await uploadToLocalStorage(req.file);
//           console.log("✅ Upload successful using local storage");
//         }
//       }

//       // Optional: delete temporary file
//       fs.unlink(req.file.path, (err) => {
//         if (err) console.error("Error deleting temporary file:", err);
//       });

//       res.status(200).json({ publicUrl: publicFileData.webViewLink });
//     } catch (err) {
//       console.error("Error uploading file:", err);
//       res.status(500).send("Internal Server Error");
//     }
//   }
// );

const uploadFileToFolder = async (auth, file, folderId) => {
  const drive = google.drive({ version: "v3", auth });

  const fileMetadata = {
    name: file.originalname,
    parents: [folderId],
  };

  const isPDF = file.originalname.toLowerCase().endsWith(".pdf");

  const media = {
    mimeType: isPDF ? "application/pdf" : file.mimetype,
    body: fs.createReadStream(file.path),
  };

  const uploadRes = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, webViewLink, webContentLink, mimeType",
  });

  return uploadRes.data;
};

app.post(
  "/upload-file-to-google-drive",
  multer.single("file"),
  async (req, res) => {
    try {
      const { userEmail, name, mimeType } = req.body;
      const file = req.file;

      if (!file || !userEmail) {
        return res.status(400).send("Missing file or userEmail.");
      }

      let driveAuth;
      if (
        fs.existsSync("./tokens.json") &&
        fs.existsSync("./oauth-credentials.json")
      ) {
        const tokens = JSON.parse(fs.readFileSync("./tokens.json", "utf8"));
        oauth2Client.setCredentials(tokens);
        driveAuth = oauth2Client;
      } else {
        driveAuth = await authenticateGoogle(); // fallback to service account
      }

      // 🔹 1. Create new folder
      const folderId = await createDriveFolder(
        driveAuth,
        "Upload_" + Date.now()
      );

      // 🔹 2. Share folder with client
      await shareDriveFolder(driveAuth, folderId, userEmail);

      // 🔹 3. Upload file into the folder
      const uploadedFile = await uploadFileToFolder(driveAuth, file, folderId);

      // 🔹 4. Delete temp file
      fs.unlink(file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });

      // 🔹 5. Respond with result
      res.status(200).json({
        message: "✅ File uploaded and folder shared successfully.",
        folderId,
        publicUrl: uploadedFile.webViewLink,
        fileId: uploadedFile.id,
      });
    } catch (err) {
      console.error("❌ Upload error:", err);
      res.status(500).send("Upload failed: " + err.message);
    }
  }
);

// app.delete("/delete-file-from-google-drive/:fileId", async (req, res) => {
//   try {
//     const { fileId } = req.params;

//     if (!fileId) {
//       return res.status(400).json({ error: "Missing fileId" });
//     }

//     let driveAuth;
//     if (
//       fs.existsSync("./tokens.json") &&
//       fs.existsSync("./oauth-credentials.json")
//     ) {
//       const tokens = JSON.parse(fs.readFileSync("./tokens.json", "utf8"));
//       oauth2Client.setCredentials(tokens);
//       driveAuth = oauth2Client;
//     } else {
//       driveAuth = await authenticateGoogle(); // fallback to service account
//     }

//     const drive = google.drive({ version: "v3", auth: driveAuth });

//     await drive.files.delete({
//       fileId: fileId,
//     });

//     res.status(200).json({ message: `✅ File ${fileId} deleted successfully` });
//   } catch (error) {
//     console.error("❌ Failed to delete file:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

app.delete("/delete-file-from-google-drive/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log("📥 Received request to delete file:", fileId);

    if (!fileId) {
      console.log("❌ Missing fileId in request params");
      return res.status(400).json({ error: "Missing fileId" });
    }

    let driveAuth;
    if (
      fs.existsSync("./tokens.json") &&
      fs.existsSync("./oauth-credentials.json")
    ) {
      console.log("🔑 Using saved OAuth tokens");
      const tokens = JSON.parse(fs.readFileSync("./tokens.json", "utf8"));
      oauth2Client.setCredentials(tokens);
      driveAuth = oauth2Client;
    } else {
      console.log("🔐 Using fallback service account auth");
      driveAuth = await authenticateGoogle(); // fallback to service account
    }

    const drive = google.drive({ version: "v3", auth: driveAuth });

    await drive.files.delete({
      fileId: fileId,
    });

    console.log(`✅ File ${fileId} deleted successfully`);
    res.status(200).json({ message: `✅ File ${fileId} deleted successfully` });
  } catch (error) {
    console.error("❌ Failed to delete file:", error);
    res.status(500).json({ error: error.message });
  }
});

// // ✅ Start server
app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
