import { google } from "googleapis";
import fs from "fs";

// Instructions for setting up OAuth2
console.log(`
=== GOOGLE OAUTH2 SETUP INSTRUCTIONS ===

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Select your project: filetesting-468011
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add these Authorized redirect URIs:
   - http://localhost:8000/auth/google/callback
7. Click "Create"
8. Download the JSON file and save it as 'oauth-credentials.json' in this folder

After downloading the credentials file, run this script again to test the setup.
`);

// Check if OAuth credentials exist
if (fs.existsSync("./oauth-credentials.json")) {
  console.log("✅ OAuth credentials found!");

  const credentials = JSON.parse(
    fs.readFileSync("./oauth-credentials.json", "utf8")
  );

  const oauth2Client = new google.auth.OAuth2(
    credentials.web.client_id,
    credentials.web.client_secret,
    "http://localhost:8000/auth/google/callback"
  );

  console.log("✅ OAuth2 client configured successfully!");
  console.log("Client ID:", credentials.web.client_id);
  console.log("Redirect URI:", "http://localhost:8000/auth/google/callback");

  console.log(`
=== NEXT STEPS ===
1. Start your server: npm start
2. Visit: http://localhost:8000/auth/google
3. Complete the OAuth flow
4. Try uploading a file - it should work now!
`);
} else {
  console.log(
    "❌ OAuth credentials not found. Please follow the setup instructions above."
  );
}
