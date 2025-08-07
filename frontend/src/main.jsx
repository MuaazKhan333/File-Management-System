import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Auth0Provider } from "@auth0/auth0-react";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Auth0Provider
    // domain="dev-37orshv26jxf68qh.us.auth0.com"
    // clientId="idQWEgNsZ3vn1JubIDvwAxZjjU2BoI38"
    // authorizationParams={{
    //   redirect_uri: window.location.origin,
    // }}
    domain="dev-37orshv26jxf68qh.us.auth0.com"
    clientId="idQWEgNsZ3vn1JubIDvwAxZjjU2BoI38"
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
    onRedirectCallback={(appState) => {
      if (appState?.addingAccount) {
        // Stay on login page
        return;
      }

      // Default redirect after login
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.replace("/Dashboard");
    }}
  >
    <App />
  </Auth0Provider>
  // </StrictMode>
);
